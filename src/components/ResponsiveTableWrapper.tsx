import React, { useRef, useState, useEffect } from 'react';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  minWidth?: string; // e.g. 'min-w-[980px]'
  showScrollButtons?: boolean;
}

export const ResponsiveTableWrapper: React.FC<ResponsiveTableWrapperProps> = ({
  children,
  id,
  className = '',
  minWidth = 'min-w-[950px]',
  showScrollButtons = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const isOverflowing = scrollWidth > clientWidth + 2;
    setHasOverflow(isOverflowing);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkScroll);

    // Initial check after paint
    const timer = setTimeout(checkScroll, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = Math.max(containerRef.current.clientWidth * 0.6, 260);
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div id={id} className={`relative flex flex-col w-full ${className}`}>
      {/* Mobile/Touch Friendly Scroll Toolbar */}
      {hasOverflow && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#f2f4f6] border-b border-[#c6c6cd]/70 text-[11px] text-[#45464d] select-none">
          <div className="flex items-center gap-1.5 font-medium text-[#006a61]">
            <span className="material-symbols-outlined text-[16px] animate-pulse">
              swap_horiz
            </span>
            <span className="hidden xs:inline sm:inline">
              Tabel dapat digeser ke kiri & kanan
            </span>
            <span className="xs:hidden sm:hidden">Geser kiri / kanan</span>
          </div>

          {showScrollButtons && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Geser tabel ke kiri"
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white text-[#006a61] border border-[#c6c6cd] shadow-2xs hover:bg-[#86f2e4]/30 active:scale-95'
                    : 'bg-transparent text-[#76777d]/40 border border-transparent cursor-not-allowed'
                }`}
                title="Geser ke kiri"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span className="hidden sm:inline">Kiri</span>
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Geser tabel ke kanan"
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-white text-[#006a61] border border-[#c6c6cd] shadow-2xs hover:bg-[#86f2e4]/30 active:scale-95'
                    : 'bg-transparent text-[#76777d]/40 border border-transparent cursor-not-allowed'
                }`}
                title="Geser ke kanan"
              >
                <span className="hidden sm:inline">Kanan</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scroll Edge Indicators */}
      <div className="relative w-full overflow-hidden">
        {hasOverflow && canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />
        )}
        {hasOverflow && canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />
        )}

        {/* The horizontally scrollable container */}
        <div
          ref={containerRef}
          className="overflow-x-auto table-scrollbar overscroll-x-contain touch-pan-x w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className={minWidth}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
