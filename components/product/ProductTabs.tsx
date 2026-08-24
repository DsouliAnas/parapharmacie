"use client";

import { useState } from "react";
import ReviewsList from "@/components/product/ReviewsList";
import ReviewForm from "@/components/product/ReviewForm";

type ProductTab =
  | "description"
  | "details"
  | "reviews";

interface ProductBrand {
  name: string;
}

interface ProductCategory {
  name: string;
}

interface ProductSubcategory {
  name: string;
}

interface ProductTabsProps {
  product: {
    _id: string;
    description: string;
    benefits?: string[];
    usage?: string[];
    name: string;
    stock: number;
    category?: ProductCategory;
    subcategory?: ProductSubcategory;
    brand?: ProductBrand;
  };
}

interface TabButtonProps {
  id: ProductTab;
  label: string;
  activeTab: ProductTab;
  onClick: (tab: ProductTab) => void;
}

const TABS: Array<{
  id: ProductTab;
  label: string;
}> = [
  {
    id: "description",
    label: "Description",
  },
  {
    id: "details",
    label: "Détails du produit",
  },
  {
    id: "reviews",
    label: "Avis clients",
  },
];

function TabButton({
  id,
  label,
  activeTab,
  onClick,
}: TabButtonProps): React.ReactElement {
  const isActive: boolean = activeTab === id;

  return (
    <button
      type="button"
      id={`tab-${id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onClick(id)}
      className={`
        relative
        shrink-0
        whitespace-nowrap
        px-1
        pb-4
        text-sm
        font-semibold
        transition
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--forest)]
        focus-visible:ring-offset-2
        ${
          isActive
            ? "text-[var(--forest)]"
            : "text-[var(--ink)]/45 hover:text-[var(--forest)]"
        }
      `}
    >
      {label}

      {isActive && (
        <span
          aria-hidden="true"
          className="
            absolute
            bottom-0
            left-0
            right-0
            h-0.5
            rounded-full
            bg-[var(--forest)]
          "
        />
      )}
    </button>
  );
}

export default function ProductTabs({
  product,
}: ProductTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] =
    useState<ProductTab>("description");

  const safeStock: number =
    Number.isFinite(product.stock) &&
    product.stock > 0
      ? Math.floor(product.stock)
      : 0;

  const isInStock: boolean = safeStock > 0;

  function handleTabChange(
    tab: ProductTab
  ): void {
    setActiveTab(tab);
  }

  return (
    <section
      className="
        mt-12
        border-t
        border-[var(--line)]
        pt-10
        sm:mt-16
        sm:pt-12
        lg:mt-20
        lg:pt-14
      "
    >
      {/* =====================================================
          TABS
      ===================================================== */}

      <div
        className="
          -mx-4
          overflow-x-auto
          border-b
          border-[var(--line)]
          px-4
          sm:-mx-6
          sm:px-6
          lg:mx-0
          lg:px-0
        "
        role="tablist"
        aria-label="Informations du produit"
      >
        <div className="flex min-w-max gap-6 sm:gap-8">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              activeTab={activeTab}
              onClick={handleTabChange}
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {activeTab === "description" && (
        <div
          id="panel-description"
          role="tabpanel"
          aria-labelledby="tab-description"
          tabIndex={0}
          className="
            max-w-4xl
            py-8
            outline-none
            sm:py-10
          "
        >
          <h2
            className="
              font-display
              text-xl
              font-medium
              text-[var(--forest)]
              sm:text-2xl
            "
          >
            Description
          </h2>

          <p
            className="
              mt-4
              whitespace-pre-line
              break-words
              text-sm
              leading-7
              text-[var(--ink)]/70
              sm:mt-5
            "
          >
            {product.description}
          </p>

          {/* BENEFITS */}

          {product.benefits &&
            product.benefits.length > 0 && (
              <div className="mt-8 sm:mt-10">
                <h3
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--forest)]
                  "
                >
                  Les avantages
                </h3>

                <ul className="mt-4 space-y-3 sm:mt-5">
                  {product.benefits.map(
                    (benefit, index) => (
                      <li
                        key={`${benefit}-${index}`}
                        className="
                          flex
                          gap-3
                          text-sm
                          leading-6
                          text-[var(--ink)]/70
                        "
                      >
                        <span
                          aria-hidden="true"
                          className="
                            mt-2
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-[var(--clay)]
                          "
                        />

                        <span className="min-w-0 break-words">
                          {benefit}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* USAGE */}

          {product.usage &&
            product.usage.length > 0 && (
              <div className="mt-8 sm:mt-10">
                <h3
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--forest)]
                  "
                >
                  Conseils d&apos;utilisation
                </h3>

                <ol className="mt-4 space-y-4 sm:mt-5">
                  {product.usage.map(
                    (step, index) => (
                      <li
                        key={`${step}-${index}`}
                        className="
                          flex
                          gap-3
                          text-sm
                          leading-6
                          text-[var(--ink)]/70
                          sm:gap-4
                        "
                      >
                        <span
                          aria-hidden="true"
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[var(--forest)]
                            text-xs
                            font-semibold
                            text-[var(--paper)]
                          "
                        >
                          {index + 1}
                        </span>

                        <span className="min-w-0 break-words">
                          {step}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}
        </div>
      )}

      {/* =====================================================
          DETAILS
      ===================================================== */}

      {activeTab === "details" && (
        <div
          id="panel-details"
          role="tabpanel"
          aria-labelledby="tab-details"
          tabIndex={0}
          className="
            max-w-3xl
            py-8
            outline-none
            sm:py-10
          "
        >
          <h2
            className="
              font-display
              text-xl
              font-medium
              text-[var(--forest)]
              sm:text-2xl
            "
          >
            Détails du produit
          </h2>

          <div
            className="
              mt-5
              divide-y
              divide-[var(--line)]
              border-y
              border-[var(--line)]
              sm:mt-6
            "
          >
            {/* BRAND */}

            {product.brand?.name && (
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:gap-6
                "
              >
                <span className="text-sm text-[var(--ink)]/50">
                  Marque
                </span>

                <span
                  className="
                    break-words
                    text-sm
                    font-medium
                    text-[var(--ink)]
                    sm:text-right
                  "
                >
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* CATEGORY */}

            {product.category?.name && (
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:gap-6
                "
              >
                <span className="text-sm text-[var(--ink)]/50">
                  Catégorie
                </span>

                <span
                  className="
                    break-words
                    text-sm
                    font-medium
                    text-[var(--ink)]
                    sm:text-right
                  "
                >
                  {product.category.name}
                </span>
              </div>
            )}

            {/* SUBCATEGORY */}

            {product.subcategory?.name && (
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:gap-6
                "
              >
                <span className="text-sm text-[var(--ink)]/50">
                  Sous-catégorie
                </span>

                <span
                  className="
                    break-words
                    text-sm
                    font-medium
                    text-[var(--ink)]
                    sm:text-right
                  "
                >
                  {product.subcategory.name}
                </span>
              </div>
            )}

            {/* STOCK */}

            <div
              className="
                flex
                flex-col
                gap-1
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-6
              "
            >
              <span className="text-sm text-[var(--ink)]/50">
                Disponibilité
              </span>

              <span
                className={`
                  text-sm
                  font-medium
                  ${
                    isInStock
                      ? "text-[var(--forest)]"
                      : "text-[var(--clay)]"
                  }
                `}
              >
                {isInStock
                  ? "En stock"
                  : "Rupture de stock"}
              </span>
            </div>

            {/* PRODUCT REFERENCE */}

            <div
              className="
                flex
                flex-col
                gap-1
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-6
              "
            >
              <span className="text-sm text-[var(--ink)]/50">
                Référence
              </span>

              <span
                className="
                  max-w-full
                  break-all
                  text-xs
                  text-[var(--ink)]/60
                  sm:text-right
                "
              >
                {product._id}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REVIEWS
      ===================================================== */}

      {activeTab === "reviews" && (
        <div
          id="panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          tabIndex={0}
          className="
            py-8
            outline-none
            sm:py-10
          "
        >
          <h2
            className="
              font-display
              text-xl
              font-medium
              text-[var(--forest)]
              sm:text-2xl
            "
          >
            Avis clients
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[var(--ink)]/55
            "
          >
            Découvrez les avis des clients sur ce produit.
          </p>

          {/* REVIEWS LIST */}

          <div className="mt-6 sm:mt-8">
            <ReviewsList productId={product._id} />
          </div>

          {/* REVIEW FORM */}

          <div
            className="
              mt-8
              border
              border-[var(--line)]
              p-4
              sm:mt-10
              sm:p-6
              md:p-8
            "
          >
            <div
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[var(--clay)]
              "
            >
              Laisser un avis
            </div>

            <ReviewForm productId={product._id} />
          </div>
        </div>
      )}
    </section>
  );
}