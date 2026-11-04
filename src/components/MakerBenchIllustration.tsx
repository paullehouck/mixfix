export function MakerBenchIllustration() {
  return (
    <div className="w-full shrink-0 brutal-border rounded-2xl bg-[#FBF9F3] overflow-hidden brutal-shadow">
      <svg
        viewBox="0 0 460 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
        aria-hidden="true"
      >
        {/* Clean Warm Background */}
        <rect width="460" height="140" fill="#FBF9F3" />

        {/* Bench Table Top & Slab */}
        <line
          x1="0"
          y1="110"
          x2="460"
          y2="110"
          stroke="#1E1E24"
          strokeWidth="2.5"
        />
        <rect x="0" y="111" width="460" height="29" fill="#EADDC9" />

        {/* 1. Left side: Bag of dry powder */}
        <g id="powder-bag">
          <ellipse
            cx="65"
            cy="110"
            rx="28"
            ry="3.5"
            fill="#1E1E24"
            opacity="0.12"
          />
          <path
            d="M38 110 C36 78 39 48 45 36 C49 30 81 30 85 36 C91 48 94 78 92 110 Z"
            fill="#F0EAE1"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M42 36 C42 29 49 25 65 25 C81 25 88 29 88 36 C88 41 81 44 65 44 C49 44 42 41 42 36 Z"
            fill="#DFD3BF"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect
            x="50"
            y="56"
            width="30"
            height="28"
            rx="3"
            fill="#FFFFFF"
            stroke="#1E1E24"
            strokeWidth="2"
          />
          <rect x="56" y="65" width="18" height="3" rx="1.5" fill="#1E1E24" />
          <rect
            x="58"
            y="72"
            width="14"
            height="2.5"
            rx="1.2"
            fill="#E07A5F"
          />
          {/* Powder mound at foot of sack */}
          <path
            d="M92 110 C95 104 102 103 106 106 C110 102 118 104 120 110 Z"
            fill="#FDFBF7"
            stroke="#1E1E24"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* 2. Center-Left: Digital Scale with Measuring Beaker & Stir Stick */}
        <g id="scale-and-cup">
          {/* Scale base shadow */}
          <rect
            x="146"
            y="108"
            width="92"
            height="5"
            rx="2.5"
            fill="#1E1E24"
            opacity="0.15"
          />
          {/* Scale body */}
          <rect
            x="146"
            y="96"
            width="90"
            height="14"
            rx="4"
            fill="#3D405B"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          {/* Scale feet */}
          <rect x="154" y="109" width="8" height="2.5" rx="1" fill="#1E1E24" />
          <rect x="220" y="109" width="8" height="2.5" rx="1" fill="#1E1E24" />
          {/* Scale weighing platform */}
          <rect
            x="150"
            y="90"
            width="82"
            height="7"
            rx="2"
            fill="#E2E4EB"
            stroke="#1E1E24"
            strokeWidth="2.2"
          />
          {/* Scale digital display (clean, NO numbers) */}
          <rect
            x="171"
            y="99.5"
            width="40"
            height="8"
            rx="2"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />

          {/* Liquid in Beaker */}
          <path d="M169 66 L172 89 L208 89 L211 66 Z" fill="#E8F8F7" />
          {/* Beaker Body */}
          <path
            d="M166 44 L172 90 L208 90 L214 44 Z"
            fill="#FFFFFF"
            fillOpacity="0.45"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Beaker Rim Lip */}
          <ellipse
            cx="190"
            cy="44"
            rx="24"
            ry="4"
            fill="#FFFFFF"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          {/* Liquid Meniscus */}
          <ellipse
            cx="190"
            cy="66"
            rx="21"
            ry="3.5"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="2"
          />
          {/* Measurement marks on beaker */}
          <line
            x1="170"
            y1="56"
            x2="177"
            y2="56"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="171"
            y1="66"
            x2="179"
            y2="66"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="172"
            y1="76"
            x2="178"
            y2="76"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Wooden Stir Stick */}
          <g transform="rotate(18 194 40)">
            <rect
              x="190"
              y="5"
              width="8"
              height="66"
              rx="3.5"
              fill="#E8B878"
              stroke="#1E1E24"
              strokeWidth="2.2"
            />
            <path
              d="M190 52 L190 67 C190 69.5 198 69.5 198 67 L198 52 Z"
              fill="#D96B43"
              stroke="#1E1E24"
              strokeWidth="1.8"
            />
          </g>
        </g>

        {/* 3. Splashes & Drips on Bench */}
        <g id="bench-splashes">
          <ellipse
            cx="258"
            cy="112"
            rx="9"
            ry="3"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.6"
          />
          <circle
            cx="247"
            cy="111"
            r="2.2"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.4"
          />
          <ellipse
            cx="276"
            cy="112"
            rx="6"
            ry="2.2"
            fill="#E07A5F"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />
          <circle cx="286" cy="111.5" r="1.5" fill="#E07A5F" />
        </g>

        {/* 4. Crumpled Nitrile Glove */}
        <g id="glove">
          <ellipse
            cx="330"
            cy="110"
            rx="22"
            ry="3.5"
            fill="#1E1E24"
            opacity="0.12"
          />
          <path
            d="M312 109 C310 101 316 94 324 94 C331 90 340 92 344 98 C351 95 356 100 351 107 C348 111 340 111 333 110 C326 111 318 112 312 109 Z"
            fill="#2A9D8F"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M338 97 C343 92 349 92 352 97 C354 101 349 104 344 104"
            stroke="#1E1E24"
            strokeWidth="2.2"
            fill="#2A9D8F"
          />
          <path
            d="M324 99 C328 102 332 106 337 105"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          <ellipse
            cx="316"
            cy="106"
            rx="4.5"
            ry="2.5"
            fill="#264653"
            stroke="#1E1E24"
            strokeWidth="2"
          />
        </g>

        {/* 5. Dust Mask (Workshop Respirator) */}
        <g id="dust-mask">
          <ellipse
            cx="405"
            cy="110"
            rx="26"
            ry="4"
            fill="#1E1E24"
            opacity="0.12"
          />
          <path
            d="M379 109 C372 105 373 97 381 93"
            stroke="#F4A261"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M429 109 C437 104 438 96 430 90"
            stroke="#F4A261"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M378 108 C376 90 387 69 405 66 C422 69 433 90 431 108 C420 111 391 111 378 108 Z"
            fill="#FFFFFF"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M396 69 Q405 67 414 69"
            stroke="#708090"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x="397"
            y="83"
            width="16"
            height="13"
            rx="3.5"
            fill="#3D405B"
            stroke="#1E1E24"
            strokeWidth="2"
          />
          <line
            x1="400"
            y1="88"
            x2="410"
            y2="88"
            stroke="#1FB5A6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="400"
            y1="92"
            x2="410"
            y2="92"
            stroke="#1FB5A6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default MakerBenchIllustration;
