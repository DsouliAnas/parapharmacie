"use client";

interface PrintBonButtonProps {
  order: {
    _id: string;
    customerName: string;
    customerEmail: string;
    phone: string;
    backupPhone?: string;
    address: string;
    totalPrice: number;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    paymentMethod: string;
    products: {
      product: { name: string } | null;
      quantity: number;
      price: number;
    }[];
    createdAt: string;
  };
}

const STATUS_EMOJIS: Record<string, string> = {
  Pending: "⏳",
  Processing: "⚙️",
  Shipped: "🚚",
  Delivered: "✅",
  Cancelled: "❌",
};

export default function PrintBonButton({ order }: PrintBonButtonProps) {
  function printBonDeCommande() {
    const printWindow = window.open("", "_blank", "width=800,height=900");

    if (!printWindow) {
      alert("Impossible d'ouvrir la fenêtre d'impression. Vérifiez le bloqueur de pop-ups.");
      return;
    }

    const productsRows = order.products
      .map(
        (item, index) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${item.product?.name ?? "Produit supprimé"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toFixed(2)} TND</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${(item.price * item.quantity).toFixed(2)} TND</td>
        </tr>
      `
      )
      .join("");

    const subtotal = order.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = Math.max(order.totalPrice - subtotal, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Bon de commande - ${order.customerName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #fff;
              padding: 32px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #7C8B73;
              padding-bottom: 20px;
              margin-bottom: 28px;
            }
            .header h1 {
              font-size: 26px;
              color: #7C8B73;
            }
            .header .meta {
              text-align: right;
              font-size: 13px;
              color: #6b7280;
            }
            .section { margin-bottom: 28px; }
            .section-title {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #7C8B73;
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 24px;
              font-size: 14px;
            }
            .info-label {
              color: #6b7280;
              font-size: 12px;
              display: block;
            }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th {
              background: #f3f4f6;
              text-align: left;
              padding: 10px 12px;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            th.right { text-align: right; }
            th.center { text-align: center; }
            .total-row {
              margin-top: 20px;
              background: #7C8B73;
              color: white;
              padding: 16px 20px;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 18px;
              font-weight: 700;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 600;
              background: #f3f4f6;
              color: #374151;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px dashed #d1d5db;
              font-size: 12px;
              color: #9ca3af;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>📦 Bon de commande</h1>
              <p style="margin-top: 6px; color: #6b7280; font-size: 14px;">
                Réf: ${order._id}
              </p>
            </div>
            <div class="meta">
              <p>Date de commande : ${new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric"
              })}</p>
              <p style="margin-top: 4px;">
                Statut :
                <span class="status-badge">${STATUS_EMOJIS[order.status] ?? ""} ${order.status}</span>
              </p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Client</div>
            <div class="info-grid">
              <p>
                <span class="info-label">Nom</span>
                <strong>${order.customerName}</strong>
              </p>
              <p>
                <span class="info-label">Téléphone</span>
                ${order.phone}
              </p>
              ${order.backupPhone ? `
                <p>
                  <span class="info-label">Téléphone de secours</span>
                  ${order.backupPhone}
                </p>` : ""}
              <p>
                <span class="info-label">Email</span>
                ${order.customerEmail}
              </p>
              <p style="grid-column: 1 / -1;">
                <span class="info-label">Adresse de livraison</span>
                ${order.address}
              </p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Produits commandés</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Produit</th>
                  <th class="center" style="width: 90px;">Qté</th>
                  <th class="right" style="width: 110px;">Prix unit.</th>
                  <th class="right" style="width: 120px;">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${productsRows}
              </tbody>
            </table>

            <div style="margin-top: 16px; font-size: 14px; color: #6b7280;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Sous-total</span>
                <span>${subtotal.toFixed(2)} TND</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Livraison</span>
                <span>${deliveryFee.toFixed(2)} TND</span>
              </div>
            </div>

            <div class="total-row">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)} TND</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Paiement</div>
            <p style="font-size: 14px;">
              Méthode : <strong>${order.paymentMethod}</strong>
            </p>
          </div>

          <div class="footer">
            Document généré automatiquement — Bon de commande
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  return (
    <button
      type="button"
      onClick={printBonDeCommande}
    >
      🖨️ Imprimer
    </button>
  );
}