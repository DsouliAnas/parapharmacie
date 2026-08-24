import Link from "next/link";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

const shopLinks: FooterLink[] = [
  {
    label: "Visage",
    href: "/shop?category=6a73aba4a6de8ec63ed02083",
  },
  {
    label: "Cheveux",
    href: "/shop?category=6a73aba4a6de8ec63ed02084",
  },
  {
    label: "Corps",
    href: "/shop?category=6a73aba4a6de8ec63ed02085",
  },
  {
    label: "Compléments",
    href: "/shop?category=6a73aba4a6de8ec63ed02086",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden bg-[var(--sage-dark)] text-black"
      aria-label="Pied de page"
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-black/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* Main footer */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10"
                aria-hidden="true"
              >
                <Leaf size={18} strokeWidth={1.75} />
              </span>

              <span className="font-display text-2xl font-medium">
                Fairy&apos;s
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-black/70">
              Votre parapharmacie en ligne. Des produits santé et beauté
              sélectionnés avec soin, pour prendre soin de vous au quotidien.
            </p>
          </div>

          {/* Boutique */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
              Boutique
            </h2>

            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-black/75 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-black/30"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
              Contact
            </h2>

            <address className="mt-5 not-italic">
              <ul className="space-y-4 text-sm text-black/75">
                <li className="flex items-start gap-3">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />

                  <span>Tunis, Tunisie</span>
                </li>

                <li className="flex items-center gap-3">
                  <Phone
                    size={17}
                    className="shrink-0"
                    aria-hidden="true"
                  />

                  <a
                    href="tel:+21600000000"
                    className="transition hover:text-black focus:outline-none focus:ring-2 focus:ring-black/30"
                  >
                    +216 00 000 000
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <Mail
                    size={17}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />

                  <a
                    href="mailto:contact@fairys.tn"
                    className="break-all transition hover:text-black focus:outline-none focus:ring-2 focus:ring-black/30 sm:break-normal"
                  >
                    contact@fairys.tn
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-black/10 pt-6 text-xs text-black/50 sm:mt-14">
          <p className="text-center">
            © {currentYear} Fairy&apos;s Parapharmacie. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}