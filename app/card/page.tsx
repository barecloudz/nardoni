'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const links = [
  {
    label: 'Book a Free Strategy Call',
    href: '/book-a-call',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Our Services',
    href: '/services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    label: 'Call Us: 803-977-4285',
    href: 'tel:8039774285',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.12 2.22 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
  },
  {
    label: 'Send Us an Email',
    href: 'mailto:nardonidigital@gmail.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    label: 'Visit Our Website',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
  },
]

export default function CardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .card-page {
          min-height: 100dvh;
          background-color: #f5f4f0;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(180,180,180,0.25) 0%, transparent 70%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .card-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 100%, rgba(160,160,160,0.12) 0%, transparent 70%);
          pointer-events: none;
        }


        .company-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 6vw, 2.75rem);
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(160deg, #1a1a1a 0%, #404040 35%, #6a6a6a 60%, #404040 80%, #1a1a1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          text-align: center;
        }

        .tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #888880;
          text-align: center;
        }

        .divider {
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #b0b0a8, transparent);
          margin: 0 auto;
        }

        .link-btn {
          width: 100%;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 24px;
          border-radius: 100px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #2a2a2a;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.82) 0%,
            rgba(255,255,255,0.55) 40%,
            rgba(248,248,248,0.62) 70%,
            rgba(255,255,255,0.78) 100%
          );
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.92);
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(180,180,180,0.25),
            inset 1px 0 0 rgba(255,255,255,0.7),
            inset -1px 0 0 rgba(200,200,200,0.2),
            0 4px 24px rgba(0,0,0,0.07),
            0 1px 4px rgba(0,0,0,0.05),
            0 0 0 0.5px rgba(200,200,200,0.4);
        }

        .link-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0) 100%
          );
          border-radius: 100px 100px 0 0;
          pointer-events: none;
        }

        .link-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 55%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.4),
            transparent
          );
          transform: skewX(-18deg);
          transition: left 0.55s ease;
          pointer-events: none;
        }

        .link-btn:hover::after {
          left: 160%;
        }

        .link-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.92) 0%,
            rgba(255,255,255,0.65) 40%,
            rgba(248,248,248,0.72) 70%,
            rgba(255,255,255,0.88) 100%
          );
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(180,180,180,0.2),
            inset 1px 0 0 rgba(255,255,255,0.8),
            inset -1px 0 0 rgba(200,200,200,0.15),
            0 8px 32px rgba(0,0,0,0.1),
            0 2px 8px rgba(0,0,0,0.07),
            0 0 0 0.5px rgba(200,200,200,0.4);
        }

        .link-btn:active {
          transform: translateY(0px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(180,180,180,0.3),
            0 1px 6px rgba(0,0,0,0.08),
            0 0 0 0.5px rgba(200,200,200,0.4);
        }

        .link-btn .btn-icon {
          flex-shrink: 0;
          opacity: 0.45;
          color: #2a2a2a;
        }

        .link-btn .btn-label {
          flex: 1;
          text-align: center;
          padding-right: 18px;
        }

        .footer-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #999990;
          text-align: center;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeSlideUp 0.6s ease forwards;
          opacity: 0;
        }

        .delay-0  { animation-delay: 0.05s; }
        .delay-1  { animation-delay: 0.15s; }
        .delay-2  { animation-delay: 0.25s; }
        .delay-3  { animation-delay: 0.38s; }
        .delay-4  { animation-delay: 0.46s; }
        .delay-5  { animation-delay: 0.54s; }
        .delay-6  { animation-delay: 0.62s; }
        .delay-7  { animation-delay: 0.70s; }
        .delay-8  { animation-delay: 0.78s; }
      `}</style>

      <div className="card-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '460px' }}>

          {/* Logo */}
          <div className="animate-in delay-0" style={{ width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/images/drawing.svg" alt="Nardoni Digital" style={{ width: 72, height: 72, objectFit: 'contain', filter: 'brightness(0) saturate(100%)' }} />
          </div>

          {/* Name + tagline */}
          <div className="animate-in delay-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h1 className="company-name">Nardoni Digital</h1>
            <p className="tagline">Web &amp; App Development &nbsp;·&nbsp; Marketing &nbsp;·&nbsp; AI Automations</p>
          </div>

          {/* Divider */}
          <div className="divider animate-in delay-2" />

          {/* Links */}
          <div
            className="animate-in delay-3"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}
          >
            {links.map((link, i) => {
              const isExternal = link.href.startsWith('tel:') || link.href.startsWith('mailto:')
              const delayClass = `delay-${i + 3}`
              if (isExternal) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`link-btn animate-in ${delayClass}`}
                  >
                    <span className="btn-icon">{link.icon}</span>
                    <span className="btn-label">{link.label}</span>
                  </a>
                )
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`link-btn animate-in ${delayClass}`}
                >
                  <span className="btn-icon">{link.icon}</span>
                  <span className="btn-label">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <p className="footer-text animate-in delay-8">
            Nardoni Digital LLC &nbsp;·&nbsp; Hendersonville, NC
          </p>
        </div>
      </div>
    </>
  )
}
