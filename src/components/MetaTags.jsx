import React from "react";
import { Helmet } from "react-helmet";

const MetaTags = ({
    title = "ScanPad - OCR-Assisted Notepad",
    description = "An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time. Simply paste an image to get started!",
    keywords = "OCR, rich text editor, image to text, text transcription, document editor, text processing, assisted editing, ScanPad, OCR transcription, OCR editor, OCR text editor, OCR text transcription, document editor, text editor, OCR-assisted",
    ogTitle = "ScanPad - Convert Images to Text",
    ogDescription = "Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription.",
    ogImage = "/icon.svg",
    ogUrl = typeof window !== "undefined" ? window.location.href : "",
    twitterCard = "summary_large_image",
    twitterTitle = "ScanPad - Convert Images to Text",
    twitterDescription = "Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription.",
    twitterImage = "/icon.svg",
    canonicalUrl = typeof window !== "undefined" ? window.location.href : "",
    author = "R.Mabunga",
    language = "English",
    themeColor = "#000000",
    viewport = "width=device-width, initial-scale=1.0",
    charset = "utf-8",
    favicon = "/icon.svg",
    appleTouchIcon = "/icon.svg",
    structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "ScanPad",
        description: "An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time.",
        applicationCategory: "Text Editor",
        operatingSystem: "Web Browser",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    },
    noindex,
    nofollow,
    robots,
    manifest,
    alternateLanguages,
}) => {
    // Combine meta robots directives
    const robotsContent = robots || `${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content={robotsContent} />
            <meta name="language" content={language} />
            <meta name="theme-color" content={themeColor} />
            <meta name="viewport" content={viewport} />
            <meta charSet={charset} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={ogUrl} />
            <meta property="og:type" content="website" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={twitterTitle} />
            <meta name="twitter:description" content={twitterDescription} />
            <meta name="twitter:image" content={twitterImage} />

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Favicon and Icons */}
            {favicon && <link rel="icon" href={favicon} />}
            {appleTouchIcon && <link rel="apple-touch-icon" href={appleTouchIcon} />}

            {/* Web App Manifest */}
            {manifest && <link rel="manifest" href={manifest} />}

            {/* Alternate Languages */}
            {alternateLanguages && alternateLanguages.map(({ href, hreflang }) => <link key={hreflang} rel="alternate" href={href} hreflang={hreflang} />)}

            {/* Structured Data */}
            {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
        </Helmet>
    );
};

export default MetaTags;
