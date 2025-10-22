const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/db");

const createCheckoutSession = async (req, res, next) => {
  const { appointmentId } = req.params;
  const patientId = req.user.id;

  try {
    const [
      rows,
    ] = await pool.query(
      "SELECT * FROM appointments WHERE id = ? AND patient_id = ?",
      [appointmentId, patientId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found or you are not authorized to pay for it." });
    }

    const appointment = rows[0];

    if (!appointment.fee || appointment.fee <= 0) {
      return res.status(400).json({ message: "Payment cannot be processed as the fee is not set or is zero." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment #${appointment.id} with Doctor`,
              description: `Consultation scheduled for ${new Date(
                appointment.scheduled_time
              ).toLocaleString()}`,
            },
            unit_amount: Math.round(appointment.fee * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/appointments/${appointmentId}`,
      metadata: {
        appointmentId: appointment.id,
        patientId: patientId,
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);
    next(error);
  }
};

const stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Stripe Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { appointmentId } = session.metadata;
        const paymentIntentId = session.payment_intent;

        console.log(`Payment successful for appointment ID: ${appointmentId}`);

        try {
           await pool.query(
             "UPDATE appointments SET payment_status = 'paid', status = 'confirmed', updated_at = NOW(), stripe_payment_intent_id = ? WHERE id = ? AND payment_status = 'unpaid'",
              [paymentIntentId, appointmentId]
           );
           console.log(`Appointment ${appointmentId} marked as paid.`);
        } catch(dbError) {
             console.error(`DB Error after webhook success for appointment ${appointmentId}:`, dbError);
        }
    }

    res.status(200).json({ received: true });
};

module.exports = {
  createCheckoutSession,
  stripeWebhook,
};