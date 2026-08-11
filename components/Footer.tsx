import Link from "next/link";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const shopLinks = [
  { label: "Visage", href: "/category/visage" },
  { label: "Cheveux", href: "/category/cheveux" },
  { label: "Corps", href: "/category/corps" },
  { label: "Compléments", href: "/category/complements" },
];

const helpLinks = [
  { label: "Mon compte", href: "/account" },
  { label: "Suivi de commande", href: "/orders" },
  { label: "Livraison & retours", href: "/shipping" },
  { label: "Foire aux questions", href: "/faq" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/legal" },
  { label: "Confidentialité", href: "/privacy" },
  { label: "CGV", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[var(--sage-dark)] text-bl">
      {/* subtle botanical accent, echoes the hero blobs without competing */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 bg-black/5 blur-3xl"
        style={{ borderRadius: "62% 38% 30% 70% / 60% 30% 70% 40%" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
                <Leaf size={18} strokeWidth={1.75} />
              </span>
              <span className="font-display text-2xl font-medium">
                Fairy&apos;s
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/70">
              Votre parapharmacie en ligne. Des produits santé et beauté
              sélectionnés avec soin, pour prendre soin de vous au quotidien.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fairy's sur Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
              >
<span className="text-sm font-bold">I</span>              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fairy's sur Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
              >
<span className="text-sm font-bold">f</span>              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
              Boutique
            </h3>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/75 transition hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
              Aide
            </h3>
            <ul className="mt-5 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/75 transition hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-black/75">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Tunis, Tunisie</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <a href="tel:+21600000000" className="transition hover:text-black">
                  +216 00 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <a
                  href="mailto:contact@fairys.tn"
                  className="transition hover:text-black"
                >
                  contact@fairys.tn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-6 text-xs text-black/50 md:flex-row">
          <p>© {new Date().getFullYear()} Fairy&apos;s Parapharmacie. Tous droits réservés.</p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}