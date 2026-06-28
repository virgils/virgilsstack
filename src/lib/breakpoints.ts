// JS-side breakpoints, mirroring the @custom-media values in src/app.css.
// Use these instead of hardcoding pixel widths in components.
export const BP_SM = 560; // large phone / small tablet
export const BP_MD = 768; // tablet — the "mobile" cutoff
export const BP_LG = 1024; // desktop
export const BP_XL = 1600; // wide desktop

/** True for viewport widths below the tablet breakpoint (i.e. mobile). */
export const isMobileWidth = (width: number) => width > 0 && width < BP_MD;
