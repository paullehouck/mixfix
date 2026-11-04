export function MakerBenchIllustration() {
  return (
    <div className="w-full shrink-0 brutal-border rounded-2xl bg-[#FBF9F3] overflow-hidden brutal-shadow">
      <svg
        viewBox="0 0 460 145"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
        aria-hidden="true"
      >
        {/* Subtle pegboard / dot grid background */}
        <pattern
          id="dot-grid"
          x="0"
          y="0"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="7" cy="7" r="1" fill="#1E1E24" opacity="0.1" />
        </pattern>
        <rect width="460" height="145" fill="#FBF9F3" />
        <rect width="460" height="114" fill="url(#dot-grid)" />

        {/* Bench Table Top */}
        <line
          x1="0"
          y1="115"
          x2="460"
          y2="115"
          stroke="#1E1E24"
          strokeWidth="2.5"
        />
        <rect x="0" y="116" width="460" height="29" fill="#E8DFD0" />
        {/* Bench wood grain lines */}
        <line
          x1="30"
          y1="130"
          x2="150"
          y2="130"
          stroke="#1E1E24"
          strokeWidth="1.5"
          opacity="0.25"
          strokeLinecap="round"
        />
        <line
          x1="210"
          y1="130"
          x2="390"
          y2="130"
          stroke="#1E1E24"
          strokeWidth="1.5"
          opacity="0.25"
          strokeLinecap="round"
        />

        {/* 1. Left side: Bag of dry powder (Jesmonite base / plaster / cement) */}
        <g id="powder-bag">
          <ellipse
            cx="62"
            cy="115"
            rx="30"
            ry="4"
            fill="#1E1E24"
            opacity="0.15"
          />
          <path
            d="M35 115 C33 78 35 48 42 34 C46 26 78 26 82 34 C89 48 91 78 89 115 Z"
            fill="#EFE8D8"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M40 35 C40 28 47 24 62 24 C77 24 84 28 84 35 C84 40 77 43 62 43 C47 43 40 40 40 35 Z"
            fill="#DFD2BA"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect
            x="46"
            y="58"
            width="32"
            height="30"
            rx="3"
            fill="white"
            stroke="#1E1E24"
            strokeWidth="1.8"
          />
          <line
            x1="52"
            y1="68"
            x2="72"
            y2="68"
            stroke="#1E1E24"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="76"
            x2="70"
            y2="76"
            stroke="#E07A5F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M41 52 Q50 60 60 48"
            stroke="#1E1E24"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M83 56 Q75 62 67 52"
            stroke="#1E1E24"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M89 115 C92 110 99 108 103 111 C108 106 117 109 119 115 Z"
            fill="#FAF5E8"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />
          <circle cx="108" cy="103" r="1.5" fill="#1E1E24" opacity="0.3" />
          <circle cx="122" cy="108" r="1" fill="#1E1E24" opacity="0.3" />
          <circle cx="101" cy="99" r="1.2" fill="#1E1E24" opacity="0.3" />
        </g>

        {/* 2. Center-Left: Digital Scale with Measuring Cup */}
        <g id="scale-and-cup">
          <rect
            x="142"
            y="112"
            width="102"
            height="6"
            rx="3"
            fill="#1E1E24"
            opacity="0.2"
          />
          <rect
            x="144"
            y="100"
            width="98"
            height="15"
            rx="4"
            fill="#3D405B"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          <rect x="151" y="114" width="9" height="2" rx="1" fill="#1E1E24" />
          <rect x="226" y="114" width="9" height="2" rx="1" fill="#1E1E24" />
          <rect
            x="148"
            y="94"
            width="90"
            height="7"
            rx="2"
            fill="#E0E2EC"
            stroke="#1E1E24"
            strokeWidth="2.2"
          />
          <rect
            x="168"
            y="103"
            width="50"
            height="9"
            rx="2"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />
          <text
            x="193"
            y="110.5"
            fontFamily="'Plus Jakarta Sans', monospace"
            fontWeight="700"
            fontSize="7.5"
            fill="#1E1E24"
            textAnchor="middle"
          >
            525.0g
          </text>

          {/* Liquid in Cup */}
          <path d="M171 68 L174 93 L212 93 L215 68 Z" fill="#E8F8F7" />
          {/* Cup Outline (transparent plastic beaker) */}
          <path
            d="M167 44 L173 94 L213 94 L219 44 Z"
            fill="white"
            fillOpacity="0.45"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Cup Rim lip */}
          <ellipse
            cx="193"
            cy="44"
            rx="26"
            ry="4.5"
            fill="white"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          {/* Liquid Surface meniscus */}
          <ellipse
            cx="193"
            cy="68"
            rx="22"
            ry="3.5"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.8"
          />
          {/* Measurement grad marks on beaker */}
          <line
            x1="170"
            y1="54"
            x2="178"
            y2="54"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="171"
            y1="64"
            x2="180"
            y2="64"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="172"
            y1="74"
            x2="179"
            y2="74"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="173"
            y1="84"
            x2="180"
            y2="84"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Wooden Stir Stick in cup */}
          <g transform="rotate(16 198 40)">
            <rect
              x="195"
              y="4"
              width="8"
              height="70"
              rx="3.5"
              fill="#E8B878"
              stroke="#1E1E24"
              strokeWidth="2.2"
            />
            <path
              d="M195 56 L195 70 C195 72.5 203 72.5 203 70 L203 56 Z"
              fill="#D96B43"
              stroke="#1E1E24"
              strokeWidth="1.8"
            />
          </g>
        </g>

        {/* 3. Drips and splashes on bench */}
        <g id="bench-splashes">
          <ellipse
            cx="254"
            cy="117"
            rx="9"
            ry="3"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />
          <circle
            cx="243"
            cy="116"
            r="2.2"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="1.2"
          />
          <circle cx="267" cy="118" r="1.6" fill="#1FB5A6" />
          <ellipse
            cx="304"
            cy="117"
            rx="7"
            ry="2.2"
            fill="#E07A5F"
            stroke="#1E1E24"
            strokeWidth="1.5"
          />
          <circle cx="315" cy="116" r="1.6" fill="#E07A5F" />
        </g>

        {/* 4. Secondary smaller mixing cup with spatula (terracotta mix) */}
        <g id="small-cup">
          <ellipse
            cx="282"
            cy="115"
            rx="16"
            ry="3.5"
            fill="#1E1E24"
            opacity="0.15"
          />
          <path
            d="M268 87 L273 115 L293 115 L298 87 Z"
            fill="#FAF6EE"
            stroke="#1E1E24"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M271 99 L273 114 L293 114 L295 99 Z" fill="#E07A5F" />
          <ellipse
            cx="283"
            cy="99"
            rx="12"
            ry="2.8"
            fill="#D96B43"
            stroke="#1E1E24"
            strokeWidth="1.4"
          />
          <ellipse
            cx="283"
            cy="87"
            rx="15"
            ry="3.2"
            fill="none"
            stroke="#1E1E24"
            strokeWidth="2.2"
          />
          <line
            x1="287"
            y1="104"
            x2="300"
            y2="70"
            stroke="#1E1E24"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="287"
            y1="104"
            x2="300"
            y2="70"
            stroke="#DEB887"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>

        {/* 5. Right Center: Crumpled Nitrile Rubber Glove */}
        <g id="gloves">
          <ellipse
            cx="346"
            cy="115"
            rx="22"
            ry="4"
            fill="#1E1E24"
            opacity="0.15"
          />
          <path
            d="M328 114 C326 106 333 99 341 99 C348 95 357 97 361 103 C368 100 373 105 368 112 C365 116 357 116 350 115 C343 116 335 117 328 114 Z"
            fill="#2A9D8F"
            stroke="#1E1E24"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M354 102 C359 97 365 96 368 101 C370 106 365 109 360 109"
            stroke="#1E1E24"
            strokeWidth="2"
            fill="#2A9D8F"
          />
          <path
            d="M361 103 C366 99 373 99 375 104 C376 109 371 112 366 112"
            stroke="#1E1E24"
            strokeWidth="2"
            fill="#2A9D8F"
          />
          <path
            d="M339 104 C344 107 348 111 353 110"
            stroke="#1E1E24"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          <ellipse
            cx="332"
            cy="111"
            rx="4.5"
            ry="2.2"
            fill="#264653"
            stroke="#1E1E24"
            strokeWidth="1.8"
          />
        </g>

        {/* 6. Far Right: Dust Mask (Workshop Respirator) */}
        <g id="dust-mask">
          <ellipse
            cx="414"
            cy="115"
            rx="28"
            ry="4.5"
            fill="#1E1E24"
            opacity="0.15"
          />
          <path
            d="M386 114 C379 110 380 101 389 97"
            stroke="#F4A261"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M438 114 C447 108 449 99 440 92"
            stroke="#F4A261"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M386 113 C384 94 394 72 412 69 C429 72 440 94 438 113 C427 116 399 116 386 113 Z"
            fill="#FFFFFF"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M403 72 Q412 70 421 72"
            stroke="#708090"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x="404"
            y="86"
            width="16"
            height="14"
            rx="3.5"
            fill="#3D405B"
            stroke="#1E1E24"
            strokeWidth="2"
          />
          <line
            x1="407"
            y1="91"
            x2="417"
            y2="91"
            stroke="#1FB5A6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="407"
            y1="95"
            x2="417"
            y2="95"
            stroke="#1FB5A6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M389 101 Q412 106 435 101"
            stroke="#1E1E24"
            strokeWidth="1.4"
            strokeDasharray="2 2"
            fill="none"
            opacity="0.3"
          />
        </g>

        {/* 7. Bench details: Pencil & terrazzo chips */}
        <g transform="rotate(-5 90 128)">
          <rect
            x="70"
            y="125"
            width="44"
            height="5.5"
            rx="1.2"
            fill="#E9C46A"
            stroke="#1E1E24"
            strokeWidth="1.6"
          />
          <polygon
            points="114,125 122,127.8 114,130.5"
            fill="#D4A373"
            stroke="#1E1E24"
            strokeWidth="1.6"
          />
          <polygon
            points="118.5,126.7 122,127.8 118.5,128.9"
            fill="#1E1E24"
          />
          <rect
            x="70"
            y="125"
            width="7"
            height="5.5"
            rx="1.2"
            fill="#E07A5F"
            stroke="#1E1E24"
            strokeWidth="1.4"
          />
        </g>

        <polygon points="226,126 230,124 228,128" fill="#E07A5F" />
        <polygon points="320,127 324,126 322,130" fill="#1FB5A6" />
        <polygon
          points="380,125 384,124 383,127 379,127"
          fill="#1E1E24"
          opacity="0.7"
        />
        <polygon points="144,127 147,125 146,129" fill="#E9A84A" />
      </svg>
    </div>
  );
}

export default MakerBenchIllustration;
