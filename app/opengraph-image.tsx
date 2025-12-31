import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'Namer.ai - AI Brand Name Generator'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #f3e8ff)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '24px',
                        padding: '40px 60px',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 80,
                            fontWeight: 800,
                            background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: 10,
                            marginTop: 0,
                        }}
                    >
                        Namer.ai
                    </h1>
                    <p
                        style={{
                            fontSize: 32,
                            color: '#334155',
                            marginTop: 0,
                            textAlign: 'center',
                            fontWeight: 500,
                        }}
                    >
                        AI-Powered Brand Name Generator
                    </p>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div style={{ fontSize: 24, color: '#64748b' }}>namer.ai</div>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported opengraph-image
            // size config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
