"use client";

import { useState } from "react";

const OPTIONS = ["Option A", "Option B", "Option C"];

const ROWS = [
  { attr: "Price", values: ["[price]", "[price]", "[price]"] },
  { attr: "Weight", values: ["[kg]", "[kg]", "[kg]"] },
  { attr: "Warranty", values: ["[years]", "[years]", "Unavailable"] },
  { attr: "Delivery", values: ["[date range]", "[date range]", "[date range]"] },
  {
    attr: "Worth knowing",
    values: [
      "Heaviest of the three",
      "No external pocket",
      "Size listed without wheels",
    ],
  },
];

const CABIN_FIT = [true, true, false];

const FAQS = [
  {
    q: "What is Opsvo?",
    a: "An AI shopping companion. You describe what you need, and it returns a short list of suitable products with reasons, comparisons and sources.",
  },
  {
    q: "Does Opsvo buy things for me?",
    a: "No, not without your approval. Opsvo hands you to the retailer to complete your purchase.",
  },
  {
    q: "Where do prices and product details come from?",
    a: "From retailers and other sources Opsvo can access. Each fact shows its source and when it was last checked.",
  },
  {
    q: "How are products ranked?",
    a: "By how well they match the requirements you gave.",
  },
];

export default function CompareAndFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: "#F7F7F5", color: "#20211F", padding: "48px 24px" }}>
      <style>{`
        .cmp-btn { outline: none; }
        .cmp-btn:focus { outline: none; }
        .cmp-row { transition: background 600ms ease-in-out; }
        .cmp-q { transition: all 600ms cubic-bezier(.17,.67,.83,.67); }
        .cmp-panel { transition: height 600ms linear; }
      `}</style>

      <section id="compare" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ color: "#686A65", fontSize: 12, letterSpacing: "0.08em" }}>
          COMPARE
        </p>
        <h2 style={{ fontSize: 24, margin: "8px 0 12px" }}>
          The differences that matter, side by side
        </h2>
        <p style={{ color: "#686A65", maxWidth: 640 }}>
          Opsvo highlights the attributes that separate your options and quietly
          drops the ones that don&apos;t.
        </p>

        <div style={{ overflowX: "auto", marginTop: 32 }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
              fontSize: 15,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #DEDFDA" }}>
                  Attribute
                </th>
                {OPTIONS.map((o) => (
                  <th
                    key={o}
                    style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #DEDFDA" }}
                  >
                    {o}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="cmp-row">
                <td style={{ padding: 12, borderBottom: "1px solid #DEDFDA" }}>
                  Fits cabin limit
                </td>
                {CABIN_FIT.map((fits, i) => (
                  <td key={i} style={{ padding: 12, borderBottom: "1px solid #DEDFDA" }}>
                    <span style={{ color: fits ? "#35664A" : "#A43F38", fontSize: 18 }}>
                      &#9679;
                    </span>
                  </td>
                ))}
              </tr>
              {ROWS.map((row) => (
                <tr key={row.attr} className="cmp-row">
                  <td style={{ padding: 12, borderBottom: "1px solid #DEDFDA" }}>
                    {row.attr}
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} style={{ padding: 12, borderBottom: "1px solid #DEDFDA" }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: "#686A65", fontSize: 13, marginTop: 12 }}>
          Prices and availability come from the retailer and can change.
        </p>
      </section>

      <section id="faq" style={{ maxWidth: 1200, margin: "64px auto 0" }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Questions</h2>

        {FAQS.map((item, i) => (
          <div key={item.q} style={{ borderBottom: "1px solid #DEDFDA" }}>
            <div
              className="cmp-q cmp-btn"
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {item.q}
              <span style={{ color: "#34483D" }}>{open === i ? "−" : "+"}</span>
            </div>
            {open === i && (
              <p className="cmp-panel" style={{ color: "#686A65", paddingBottom: 16, maxWidth: 640 }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
