'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import './Lanyard.css';

interface Profile {
    id: string;
    name: string;
    avatar?: string | null;
    color?: string;
}

export interface LanyardProps {
    profiles?: Profile[];
    onSelect?: (profileId: string) => void;
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
}

export default function Lanyard({
    profiles = [{ id: '1', name: 'User', color: '#e50914' }],
    onSelect,
}: LanyardProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Ensure we always have at least one profile
    const displayProfiles = profiles && profiles.length > 0
        ? profiles
        : [{ id: '1', name: 'Viewer', color: '#e50914' }];

    const profileCount = displayProfiles.length;

    return (
        <div className="lanyard-wrapper">
            {/* Fade overlay at top */}
            <div className="lanyard-fade-overlay"></div>

            <div className="cards-container" data-profile-count={profileCount}>
                {displayProfiles.map((profile, index) => (
                    <ProfileIDCard
                        key={profile.id || `profile-${index}`}
                        profile={profile}
                        onSelect={() => onSelect?.(profile.id)}
                        isMobile={isMobile}
                        profileCount={profileCount}
                    />
                ))}
            </div>
        </div>
    );
}

function ProfileIDCard({
    profile,
    onSelect,
    isMobile,
    profileCount
}: {
    profile: Profile;
    onSelect: () => void;
    isMobile: boolean;
    profileCount: number;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [cardRotation, setCardRotation] = useState(0);
    const [swingAngle, setSwingAngle] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(1920);

    // Update viewport width on resize
    useEffect(() => {
        const updateWidth = () => setViewportWidth(window.innerWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Responsive scale and margin based on viewport width and profile count
    const calculateScale = () => {
        const baseScale = profileCount >= 4 ? 1 : 1; // Keep cards full size
        // Reduce scale slightly on smaller screens
        if (viewportWidth < 1200) return baseScale * 0.9;
        if (viewportWidth < 1600) return baseScale * 0.95;
        return baseScale;
    };

    const calculateMargin = () => {
        // More overlap to keep cards together and inside viewport
        const widthFactor = Math.min(viewportWidth / 1920, 1);
        const baseMargin = profileCount >= 4 ? -220 : profileCount >= 3 ? -180 : -150;
        return baseMargin * widthFactor - (profileCount >= 4 ? 30 : 0);
    };

    const scale = calculateScale();
    const marginX = calculateMargin();

    // Get initials
    const initials = profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const accentColor = profile.color || '#e50914';

    // Idle swinging animation - only affects the card
    useEffect(() => {
        let animationId: number;
        let time = Math.random() * 100;

        const animate = () => {
            if (!isDragging) {
                time += 0.015;
                setSwingAngle(Math.sin(time) * 2);
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isDragging]);

    const cardRef = useRef<HTMLDivElement>(null);
    const cardImageRef = useRef<HTMLDivElement>(null);

    // Handle mouse/touch events for swipe
    const handlePointerDown = (e: React.PointerEvent) => {
        // Check if click is actually inside this card's visible image area (not the wrapper with margins)
        if (cardImageRef.current) {
            const rect = cardImageRef.current.getBoundingClientRect();
            const isInsideCard =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (!isInsideCard) return; // Ignore clicks outside the visible card image
        }

        e.stopPropagation(); // Prevent affecting other cards
        e.preventDefault(); // Prevent default to avoid issues
        setIsDragging(true);
        setStartX(e.clientX);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.stopPropagation();
        const deltaX = e.clientX - startX;
        setOffsetX(deltaX);
        setCardRotation(deltaX * 0.08);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return; // Only process if we actually started a drag/tap
        e.stopPropagation();

        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

        // Only select if swiped far enough (significant drag - 150px+)
        // Taps/clicks won't trigger selection
        if (Math.abs(offsetX) > 150) {
            onSelect();
        }

        // Reset
        setIsDragging(false);
        setOffsetX(0);
        setCardRotation(0);
    };

    // Cancel drag without triggering selection (e.g., when pointer leaves)
    const handlePointerCancel = () => {
        if (isDragging) {
            setIsDragging(false);
            setOffsetX(0);
            setCardRotation(0);
        }
    };

    return (
        <div
            ref={cardRef}
            className="id-card-wrapper group"
            style={{
                transform: `translateX(${offsetX}px) rotate(${cardRotation + swingAngle}deg) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                cursor: isDragging ? 'grabbing' : 'grab',
                marginLeft: `${marginX}px`,
                marginRight: `${marginX}px`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerCancel}
            onPointerCancel={handlePointerCancel}
        >
            {/* ID Card Background Image - includes lanyard */}
            <div ref={cardImageRef} className="id-card-image transition-all duration-300 grayscale group-hover:grayscale-0">
                <Image
                    src="/Assets/ID CARD.png"
                    alt="ID Card"
                    width={isMobile ? 400 : 700}
                    height={isMobile ? 650 : 1150}
                    priority
                    style={{
                        objectFit: 'contain',
                        pointerEvents: 'none',
                    }}
                />
            </div>

            {/* Profile Content Overlay - positioned in the white card area */}
            <div className="id-card-content transition-all duration-300">
                {/* Avatar Circle - grayscale by default */}
                <div
                    className="id-avatar transition-all duration-300 grayscale group-hover:grayscale-0"
                    style={{
                        borderColor: accentColor,
                        boxShadow: `0 0 20px ${accentColor}40`,
                        overflow: 'hidden'
                    }}
                >
                    {profile.avatar ? (
                        <Image
                            src={profile.avatar}
                            alt={profile.name}
                            width={55}
                            height={55}
                            style={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    ) : (
                        <span className="id-avatar-initials">{initials}</span>
                    )}
                </div>

                {/* Profile Name */}
                <h3 className="id-name">{profile.name}</h3>

                {/* Member Badge - grayscale by default */}
                <div
                    className="id-badge transition-all duration-300 grayscale group-hover:grayscale-0"
                    style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                        borderColor: `${accentColor}40`
                    }}
                >
                    MEMBER
                </div>

                {/* Swipe/Tap Hint */}
                <p className="id-swipe-hint">tap or swipe to select</p>
            </div>
        </div>
    );
}
