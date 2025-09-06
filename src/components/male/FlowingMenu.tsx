import React from "react";
import { gsap } from "gsap";
import Link from "next/link";
import Image from "next/image";

interface MenuItemProps {
  link: string;
  text: string;
  image?: string | { src: string }; // allow both string URL & imported image
}

interface FlowingMenuProps {
  items?: MenuItemProps[];
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [] }) => {
  return (
    <div className="flowing-menu-wrap">
      <nav className="flowing-menu">
        {items.map((item, idx) => (
          <MenuItem key={idx} {...item} />
        ))}
      </nav>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: "expo" };

  const distMetric = (x: number, y: number, x2: number, y2: number): number => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): "top" | "bottom" => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });

    tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });

    tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0).to(
      marqueeInnerRef.current,
      { y: edge === "top" ? "101%" : "-101%" },
      0
    );
  };

  // ✅ Fix: Always resolve image URL
  const imageUrl = React.useMemo(() => {
    if (!image) return null;
    return typeof image === "string" ? image : image.src;
  }, [image]);

  const repeatedMarqueeContent = React.useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <React.Fragment key={idx}>
        <span>{text}</span>
      {imageUrl && (
<div className="flowing-marquee__img h-[100px] w-full max-w-[600px] relative overflow-hidden rounded-xl">    <Image
      src={imageUrl}
      alt={text}
      fill   // fills parent container
      className="object-cover"
      sizes="600px"
      priority={false} // or true if you want eager loading
    />
  </div>
)}
      </React.Fragment>
    ));
  }, [text, imageUrl]);

  return (
    <div className="flowing-menu__item" ref={itemRef}>
      <Link
        className="flowing-menu__item-link"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </Link>
      <div className="flowing-marquee" ref={marqueeRef}>
        <div className="flowing-marquee__inner-wrap" ref={marqueeInnerRef}>
          <div className="flowing-marquee__inner" aria-hidden="true">
            {repeatedMarqueeContent}
            {repeatedMarqueeContent}
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
