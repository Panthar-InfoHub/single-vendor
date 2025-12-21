// Email template for user when order is placed
export const orderPlacedUser = (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `Order Confirmation - Order #${orderDetails.orderId}`,
    text: `${orderDetails.customerName ? `Dear ${orderDetails.customerName},` : "Hello,"}

Thank you for your order! Your order #${orderDetails.orderId} has been successfully placed.

Order Details:
${orderDetails.items
  .map((item) => `- ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`)
  .join("\n")}

Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}
Shipping Address: ${orderDetails.shippingAddress}

We'll send you tracking information once your order ships.

Best regards,
Vyomtics Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 32px 24px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 500; letter-spacing: 1px;">VYOMTICS</h1>
        </div>
        
        <div style="padding: 40px 24px;">
          <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 16px; font-weight: 500;">Order Confirmation</h2>
          <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 14px;">Order #${
            orderDetails.orderId
          }</p>
          
          <p style="color: #111827; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">
            ${orderDetails.customerName ? `Hello ${orderDetails.customerName},` : "Hello,"}<br><br>
            Thank you for your order. We have received your order and it is being processed.
          </p>
          
          <div style="margin-bottom: 32px;">
            <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 15px; font-weight: 500;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; font-weight: 500; font-size: 13px; color: #374151;">Item</th>
                  <th style="padding: 12px; text-align: center; font-weight: 500; font-size: 13px; color: #374151;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; font-size: 13px; color: #374151;">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; font-size: 13px; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; font-size: 14px; color: #111827;">Total</td>
                  <td style="padding: 12px; text-align: right; color: #111827; font-size: 14px; font-weight: 600;">₹${orderDetails.totalAmount.toFixed(
                    2
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 32px;">
            <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 15px; font-weight: 500;">Shipping Address</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">${
              orderDetails.shippingAddress
            }</p>
          </div>
          
          <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
            We will send you tracking information once your order ships.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 13px; text-align: center;">Vyomtics</p>
        </div>
      </div>
    `,
  };
};

// Email template for admin when new order is placed
export const orderPlacedAdmin = (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  orderDate: string;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `New Order Received - Order #${orderDetails.orderId}`,
    text: `New Order Alert!

Order ID: ${orderDetails.orderId}
Order Date: ${orderDetails.orderDate}

Customer Information:
Name: ${orderDetails.customerName || "Not provided"}
Email: ${orderDetails.customerEmail || "Not provided"}
Phone: ${orderDetails.customerPhone || "Not provided"}

Order Items:
${orderDetails.items
  .map((item) => `- ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`)
  .join("\n")}

Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}
Payment Method: ${orderDetails.paymentMethod}
Shipping Address: ${orderDetails.shippingAddress}

Please process this order promptly.

Vyomtics Admin System`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 32px 24px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 500; letter-spacing: 1px;">VYOMTICS</h1>
          <p style="color: #9ca3af; margin: 0; font-size: 13px;">Admin Portal</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 16px 24px; border-bottom: 1px solid #e5e7eb;">
          <p style="color: #111827; margin: 0; font-size: 14px; font-weight: 500;">New Order: #${
            orderDetails.orderId
          }</p>
          <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">${
            orderDetails.orderDate
          }</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <div style="margin-bottom: 32px;">
            <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 15px; font-weight: 500;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500; width: 30%; color: #6b7280; font-size: 13px;">Name</td>
                <td style="padding: 12px; color: #111827; font-size: 14px;">${
                  orderDetails.customerName || "Not provided"
                }</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 12px;">${
                  orderDetails.customerEmail
                    ? `<a href="mailto:${orderDetails.customerEmail}" style="color: #111827; text-decoration: none; font-size: 14px;">${orderDetails.customerEmail}</a>`
                    : '<span style="color: #111827; font-size: 14px;">Not provided</span>'
                }</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500; color: #6b7280; font-size: 13px;">Phone</td>
                <td style="padding: 12px;">${
                  orderDetails.customerPhone
                    ? `<a href="tel:${orderDetails.customerPhone}" style="color: #111827; text-decoration: none; font-size: 14px;">${orderDetails.customerPhone}</a>`
                    : '<span style="color: #111827; font-size: 14px;">Not provided</span>'
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: 500; color: #6b7280; font-size: 13px;">Payment</td>
                <td style="padding: 12px; color: #111827; font-size: 14px;">${
                  orderDetails.paymentMethod || "Not specified"
                }</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-bottom: 32px;">
            <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 15px; font-weight: 500;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; font-weight: 500; font-size: 13px; color: #374151;">Item</th>
                  <th style="padding: 12px; text-align: center; font-weight: 500; font-size: 13px; color: #374151;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; font-size: 13px; color: #374151;">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 500; font-size: 13px; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #e5e7eb; background-color: #f9fafb;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; font-size: 14px; color: #111827;">Total</td>
                  <td style="padding: 12px; text-align: right; color: #111827; font-size: 15px; font-weight: 600;">₹${orderDetails.totalAmount.toFixed(
                    2
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 15px; font-weight: 500;">Shipping Address</h2>
            <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">${
              orderDetails.shippingAddress
            }</p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 13px; text-align: center;">Vyomtics Admin System</p>
        </div>
      </div>
    `,
  };
};

export const ResetPasswordEmailTemplate = ({ link }: { link: URL }) => {
  return {
    subject: "Reset your password - Vyomtics",
    text: `Click the link to reset your password: ${link}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 32px 24px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 500; letter-spacing: 1px;">VYOMTICS</h1>
        </div>
        
        <div style="padding: 40px 24px;">
          <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">Reset Your Password</h2>
          <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 14px; line-height: 1.6;">
            You requested to reset your password for your Vyomtics account. Click the button below to create a new password.
          </p>
          
          <div style="margin: 32px 0;">
            <a href="${link}" 
               style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; display: inline-block; font-weight: 500; font-size: 14px;">
              Reset Password
            </a>
          </div>
          
          <div style="border-left: 3px solid #e5e7eb; padding-left: 16px; margin: 32px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">Important</p>
            <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 16px; margin-top: 32px; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="word-break: break-all; color: #111827; font-size: 12px; margin: 0;">
              ${link}
            </p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 13px; text-align: center;">Vyomtics</p>
        </div>
      </div>
    `,
  };
};
