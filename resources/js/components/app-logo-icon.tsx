import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            src="/images/ssc.png"
            alt="CouncilForge"
            className="h-12 w-12"
            {...props}
        />
    );
}
