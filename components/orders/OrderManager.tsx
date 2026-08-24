"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* =========================================================
   TYPES
========================================================= */

interface OrderProduct {
  product: {
    name: string;
    images?: string[];
  } | null;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  backupPhone?: string;
  address: string;
  products: OrderProduct[];
  totalPrice: number;
  status: OrderStatus;
  deliveredAt?: string;
}

interface OrderManagerProps {
  orders: Order[];
}

interface ErrorResponse {
  error?: string;
}

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const ALLOWED_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const STATUS_EMOJIS: Record<OrderStatus, string> = {
  Pending: "⏳",
  Processing: "⚙️",
  Shipped: "🚚",
  Delivered: "✅",
  Cancelled: "❌",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:
    "border-yellow-200 bg-yellow-100 text-yellow-700",

  Processing:
    "border-blue-200 bg-blue-100 text-blue-700",

  Shipped:
    "border-purple-200 bg-purple-100 text-purple-700",

  Delivered:
    "border-green-200 bg-green-100 text-green-700",

  Cancelled:
    "border-red-200 bg-red-100 text-red-700",
};

/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderManager({
  orders,
}: OrderManagerProps): React.ReactElement {
  const router = useRouter();

  const [localOrders, setLocalOrders] =
    useState<Order[]>(orders);

  const [loadingOrderId, setLoadingOrderId] =
    useState<string | null>(null);

  /* =======================================================
     UPDATE ORDER STATUS
  ======================================================= */

  async function updateStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> {
    const previousOrders: Order[] = [...localOrders];

    try {
      setLoadingOrderId(orderId);

      /*
       * Optimistic UI update.
       */
      setLocalOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order._id !== orderId) {
            return order;
          }

          return {
            ...order,
            status: newStatus,
            deliveredAt:
              newStatus === "Delivered"
                ? new Date().toISOString()
                : order.deliveredAt,
          };
        })
      );

      const response: Response = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Impossible de modifier le statut de la commande.";

        try {
          const errorData =
            (await response.json()) as ErrorResponse;

          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Ignore invalid error response.
        }

        setLocalOrders(previousOrders);

        alert(errorMessage);

        return;
      }

      /*
       * Refresh server data after successful update.
       */
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      setLocalOrders(previousOrders);

      alert(
        "Une erreur est survenue lors de la modification du statut."
      );
    } finally {
      setLoadingOrderId(null);
    }
  }

  /* =======================================================
     PRINT ORDER
  ======================================================= */

  function printBonDeCommande(
    order: Order
  ): void {
    const printWindow: Window | null =
      window.open(
        "",
        "_blank",
        "width=900,height=900"
      );

    if (!printWindow) {
      alert(
        "Impossible d'ouvrir la fenêtre d'impression. Vérifiez le bloqueur de pop-ups."
      );

      return;
    }

    const orderReference: string =
      order.orderNumber ??
      order._id;

    const customerName: string =
      escapeHtml(order.customerName);

    const customerEmail: string =
      escapeHtml(order.customerEmail);

    const phone: string =
      escapeHtml(order.phone);

    const address: string =
      escapeHtml(order.address);

    const backupPhone: string | null =
      order.backupPhone
        ? escapeHtml(order.backupPhone)
        : null;

    const productsRows: string =
      order.products
        .map(
          (
            item: OrderProduct,
            index: number
          ): string => {
            const productName: string =
              item.product?.name ??
              "Produit supprimé";

            const safeProductName: string =
              escapeHtml(productName);

            const subtotal: number =
              item.price * item.quantity;

            return `
              <tr>
                <td class="cell">
                  ${index + 1}
                </td>

                <td class="cell">
                  ${safeProductName}
                </td>

                <td class="cell center">
                  ${item.quantity}
                </td>

                <td class="cell right">
                  ${item.price.toFixed(2)} TND
                </td>

                <td class="cell right strong">
                  ${subtotal.toFixed(2)} TND
                </td>
              </tr>
            `;
          }
        )
        .join("");

    const deliveredInfo: string =
      order.deliveredAt
        ? `
          <p class="delivered">
            ✅ Livrée le
            ${new Date(
              order.deliveredAt
            ).toLocaleDateString("fr-FR")}
          </p>
        `
        : "";

    const backupPhoneHtml: string =
      backupPhone
        ? `
          <p>
            <span class="info-label">
              Téléphone de secours
            </span>
            ${backupPhone}
          </p>
        `
        : "";

    const printDate: string =
      new Date().toLocaleDateString(
        "fr-FR"
      );

    const status: string =
      `${STATUS_EMOJIS[order.status]} ${order.status}`;

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="fr">

        <head>

          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Bon de commande - ${customerName}
          </title>

          <style>

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                Helvetica,
                Arial,
                sans-serif;

              color: #111827;
              background: #ffffff;

              padding: 32px;

              line-height: 1.5;
            }

            .container {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;

              gap: 30px;

              border-bottom:
                3px solid #7c8b73;

              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .brand {
              color: #7c8b73;
              font-size: 28px;
              font-weight: 700;
            }

            .document-title {
              margin-top: 5px;

              color: #374151;

              font-size: 18px;
              font-weight: 600;
            }

            .reference {
              margin-top: 7px;

              color: #6b7280;

              font-size: 13px;
            }

            .meta {
              text-align: right;

              color: #6b7280;

              font-size: 13px;
            }

            .status {
              display: inline-block;

              margin-top: 7px;

              padding:
                5px 12px;

              border-radius: 999px;

              background: #f3f4f6;

              color: #374151;

              font-size: 13px;

              font-weight: 600;
            }

            .delivered {
              margin-top: 8px;

              color: #16a34a;

              font-weight: 600;
            }

            .section {
              margin-bottom: 30px;
            }

            .section-title {
              margin-bottom: 14px;

              padding-bottom: 7px;

              border-bottom:
                1px solid #e5e7eb;

              color: #7c8b73;

              font-size: 14px;

              font-weight: 700;

              text-transform: uppercase;

              letter-spacing: 0.05em;
            }

            .info-grid {
              display: grid;

              grid-template-columns:
                1fr 1fr;

              gap:
                14px 28px;

              font-size: 14px;
            }

            .info-label {
              display: block;

              margin-bottom: 2px;

              color: #6b7280;

              font-size: 11px;

              font-weight: 500;

              text-transform: uppercase;
            }

            .full-width {
              grid-column:
                1 / -1;
            }

            table {
              width: 100%;

              border-collapse:
                collapse;

              font-size: 14px;
            }

            th {
              padding:
                11px 12px;

              background: #f3f4f6;

              border-bottom:
                2px solid #e5e7eb;

              color: #374151;

              font-size: 11px;

              font-weight: 700;

              text-align: left;

              text-transform:
                uppercase;
            }

            .cell {
              padding:
                11px 12px;

              border-bottom:
                1px solid #e5e7eb;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .strong {
              font-weight: 600;
            }

            .total {
              display: flex;

              justify-content:
                space-between;

              align-items:
                center;

              margin-top: 20px;

              padding:
                16px 20px;

              border-radius: 10px;

              background: #7c8b73;

              color: white;

              font-size: 19px;

              font-weight: 700;
            }

            .payment {
              margin-top: 12px;

              color: #6b7280;

              font-size: 13px;
            }

            .footer {
              margin-top: 45px;

              padding-top: 16px;

              border-top:
                1px dashed #d1d5db;

              color: #9ca3af;

              font-size: 11px;

              text-align: center;
            }

            @media print {

              body {
                padding: 0;
              }

              .container {
                max-width: none;
              }

              @page {
                margin: 15mm;
              }

            }

          </style>

        </head>

        <body>

          <div class="container">

            <div class="header">

              <div>

                <div class="brand">
                  Fairy&apos;s
                </div>

                <div class="document-title">
                  Bon de commande
                </div>

                <div class="reference">
                  Référence :
                  ${escapeHtml(
                    orderReference
                  )}
                </div>

              </div>

              <div class="meta">

                <p>
                  Date d'impression :
                  ${printDate}
                </p>

                <div class="status">
                  ${status}
                </div>

                ${deliveredInfo}

              </div>

            </div>


            <div class="section">

              <div class="section-title">
                Informations client
              </div>

              <div class="info-grid">

                <p>
                  <span class="info-label">
                    Nom
                  </span>

                  <strong>
                    ${customerName}
                  </strong>
                </p>

                <p>
                  <span class="info-label">
                    Téléphone
                  </span>

                  ${phone}
                </p>

                ${backupPhoneHtml}

                <p>
                  <span class="info-label">
                    Email
                  </span>

                  ${customerEmail}
                </p>

                <p class="full-width">

                  <span class="info-label">
                    Adresse de livraison
                  </span>

                  ${address}

                </p>

              </div>

            </div>


            <div class="section">

              <div class="section-title">
                Produits commandés
              </div>

              <table>

                <thead>

                  <tr>

                    <th style="width: 45px;">
                      #
                    </th>

                    <th>
                      Produit
                    </th>

                    <th
                      style="width: 80px;"
                    >
                      Quantité
                    </th>

                    <th
                      style="width: 120px;"
                    >
                      Prix unit.
                    </th>

                    <th
                      style="width: 130px;"
                    >
                      Sous-total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${productsRows}

                </tbody>

              </table>


              <div class="total">

                <span>
                  Total
                </span>

                <span>
                  ${order.totalPrice.toFixed(
                    2
                  )} TND
                </span>

              </div>

            </div>


            <div class="footer">

              Fairy&apos;s Parapharmacie

              <br />

              Document généré automatiquement
              — Bon de commande

            </div>

          </div>


          <script>

            window.onload = function () {

              window.print();

            };

          </script>

        </body>

      </html>
    `);

    printWindow.document.close();
  }

  type OrderFilter =
  | "Active"
  | "Pending"
  | "Processing"
  | "Shipped"
  | "History";

const [orderFilter, setOrderFilter] =
  useState<OrderFilter>("Active");

const filteredOrders: Order[] =
  localOrders.filter((order: Order): boolean => {
    if (orderFilter === "Active") {
      return (
        order.status !== "Delivered" &&
        order.status !== "Cancelled"
      );
    }

    if (orderFilter === "History") {
      return (
        order.status === "Delivered" ||
        order.status === "Cancelled"
      );
    }

    return order.status === orderFilter;
  });

const activeOrdersCount: number =
  localOrders.filter(
    (order: Order) =>
      order.status !== "Delivered" &&
      order.status !== "Cancelled"
  ).length;

const historyOrdersCount: number =
  localOrders.filter(
    (order: Order) =>
      order.status === "Delivered" ||
      order.status === "Cancelled"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#7C8B73] md:text-4xl">
          📦 Gestion des commandes
        </h1>

        <p className="mt-2 text-gray-500">
          Gérez les commandes, suivez leur progression
          et validez les livraisons.
        </p>
        {/* =====================================================
    ORDER FILTERS
===================================================== */}

<div className="mt-6 overflow-x-auto">
  <div className="flex min-w-max gap-2 rounded-2xl bg-gray-100 p-1.5">
    <button
      type="button"
      onClick={() => setOrderFilter("Active")}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        orderFilter === "Active"
          ? "bg-white text-[#7C8B73] shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      📦 En cours
      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
        {activeOrdersCount}
      </span>
    </button>

    <button
      type="button"
      onClick={() => setOrderFilter("Pending")}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        orderFilter === "Pending"
          ? "bg-white text-[#7C8B73] shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      ⏳ Nouvelles
      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
        {
          localOrders.filter(
            (order) => order.status === "Pending"
          ).length
        }
      </span>
    </button>

    <button
      type="button"
      onClick={() => setOrderFilter("Processing")}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        orderFilter === "Processing"
          ? "bg-white text-[#7C8B73] shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      ⚙️ Préparation
      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
        {
          localOrders.filter(
            (order) => order.status === "Processing"
          ).length
        }
      </span>
    </button>

    <button
      type="button"
      onClick={() => setOrderFilter("Shipped")}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        orderFilter === "Shipped"
          ? "bg-white text-[#7C8B73] shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      🚚 Livraison
      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
        {
          localOrders.filter(
            (order) => order.status === "Shipped"
          ).length
        }
      </span>
    </button>

    <button
      type="button"
      onClick={() => setOrderFilter("History")}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        orderFilter === "History"
          ? "bg-white text-[#7C8B73] shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      📚 Historique
      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
        {historyOrdersCount}
      </span>
    </button>
  </div>
</div>
      </div>

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <div className="space-y-6">
{filteredOrders.map(
            (order: Order): React.ReactElement => {
            const nextStatuses: OrderStatus[] =
              ALLOWED_TRANSITIONS[
                order.status
              ];

            const isLoading: boolean =
              loadingOrderId === order._id;

            return (
              <div
                key={order._id}
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                  transition
                  hover:shadow-lg
                "
              >
                {/* =========================================
                    CUSTOMER INFORMATION
                ========================================= */}

                <div className="p-5 md:p-6">
                  <div
                    className="
                      flex
                      flex-col
                      gap-6
                      lg:flex-row
                      lg:items-start
                      lg:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <h2
                        className="
                          text-xl
                          font-bold
                          text-gray-900
                          md:text-2xl
                        "
                      >
                        👤 {order.customerName}
                      </h2>

                      <div
                        className="
                          mt-3
                          space-y-1.5
                          text-sm
                          text-gray-600
                          md:text-base
                        "
                      >
                        <p>
                          📞 {order.phone}
                        </p>

                        {order.backupPhone && (
                          <p>
                            📱 Backup:{" "}
                            {order.backupPhone}
                          </p>
                        )}

                        <p className="break-all">
                          ✉️{" "}
                          {order.customerEmail}
                        </p>

                        <p>
                          📍 {order.address}
                        </p>
                      </div>

                      {order.deliveredAt && (
                        <p className="mt-3 font-medium text-green-600">
                          ✅ Livrée le{" "}
                          {new Date(
                            order.deliveredAt
                          ).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      )}
                    </div>

                    {/* =====================================
                        STATUS + ACTIONS
                    ===================================== */}

                    <div
                      className="
                        flex
                        w-full
                        flex-col
                        items-start
                        gap-3
                        lg:w-auto
                        lg:items-end
                      "
                    >
                      <div
                        className={`
                          rounded-full
                          border
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          ${STATUS_COLORS[order.status]}
                        `}
                      >
                        {
                          STATUS_EMOJIS[
                            order.status
                          ]
                        }{" "}
                        {order.status}
                      </div>

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        {/* PRINT */}

                        <button
                          type="button"
                          onClick={() =>
                            printBonDeCommande(
                              order
                            )
                          }
                          className="
                            rounded-full
                            border
                            border-[#7C8B73]
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-[#7C8B73]
                            transition
                            hover:bg-[#7C8B73]
                            hover:text-white
                          "
                        >
                          🖨️ Imprimer bon
                        </button>

                        {/* STATUS BUTTONS */}

                        {nextStatuses.map(
                          (
                            status: OrderStatus
                          ) => (
                            <button
                              key={status}
                              type="button"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                updateStatus(
                                  order._id,
                                  status
                                )
                              }
                              className="
                                rounded-full
                                bg-[#7C8B73]
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-[#66745F]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {
                                STATUS_EMOJIS[
                                  status
                                ]
                              }{" "}
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    PRODUCTS
                ========================================= */}

                <div
                  className="
                    border-t
                    bg-gray-50
                    p-5
                    md:p-6
                  "
                >
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    🛒 Produits commandés
                  </h3>

                  <div className="space-y-3">
                    {order.products.map(
                      (
                        item: OrderProduct,
                        index: number
                      ) => (
                        <div
                          key={`${order._id}-${index}`}
                          className="
                            flex
                            flex-col
                            gap-2
                            rounded-xl
                            bg-white
                            p-4
                            shadow-sm
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product
                                ?.name ??
                                "Produit supprimé"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Quantité :{" "}
                              {item.quantity}
                            </p>

                            <p className="text-sm text-gray-500">
                              Prix unitaire :{" "}
                              {item.price.toFixed(
                                2
                              )}{" "}
                              TND
                            </p>
                          </div>

                          <div className="font-semibold text-[#7C8B73]">
                            {(
                              item.price *
                              item.quantity
                            ).toFixed(2)}{" "}
                            TND
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* =======================================
                      TOTAL
                  ======================================= */}

                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      bg-[#7C8B73]
                      p-4
                      text-white
                    "
                  >
                    <span className="text-base font-semibold md:text-lg">
                      💰 Total
                    </span>

                    <span className="text-xl font-bold md:text-2xl">
                      {order.totalPrice.toFixed(
                        2
                      )}{" "}
                      TND
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

{filteredOrders.length === 0 && (
            <div
            className="
              rounded-3xl
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >
            <div className="text-5xl">
              📦
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Aucune commande
            </h2>

            <p className="mt-2 text-gray-500">
              Il n&apos;y a aucune commande
              pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}