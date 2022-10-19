import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // checkout session é criada para que o stripe receba as informações da compra do cliente:
  // intens, quantidades, dados do pagamento, etc
  const { priceId } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!priceId) {
    return res.status(400).json({ error: "Price not found" });
  }

  /* ?session_id={CHECKOUT_SESSION_ID} =>
        retorna o ID do checkout session após o pagamento com os dados da compra
        para utilizá-los na pág de /success */
  const successUrl = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_URL}/`;

  const checkoutSession = await stripe.checkout.sessions.create({
    success_url: successUrl,
    cancel_url: cancelUrl,
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  });

  return res.status(201).json({
    //201 - algo foi criado
    checkoutUrl: checkoutSession.url,
  });
}
