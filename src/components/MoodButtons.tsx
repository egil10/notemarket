'use client';

import { useState } from 'react';
import { Smile, Meh, Frown, Laugh, Annoyed, Angry } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import styles from './MoodButtons.module.css';

export const MoodButtons = () => {
    const [animatingMood, setAnimatingMood] = useState<string | null>(null);
    const supabase = createClient();

    const handleMoodClick = async (mood: 'happy' | 'neutral' | 'sad') => {
        // Trigger animation
        setAnimatingMood(mood);

        // Track in Supabase (fire and forget)
        try {
            await supabase
                .from('mood_clicks')
                .insert({
                    mood: mood,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            // Silently fail - this is just for fun analytics
            console.log('Mood tracking error (non-critical):', error);
        }

        // Reset animation after 1.5 seconds
        setTimeout(() => {
            setAnimatingMood(null);
        }, 1500);
    };

    const getIcon = (mood: 'happy' | 'neutral' | 'sad') => {
        const isAnimating = animatingMood === mood;
        
        if (mood === 'happy') {
            return isAnimating ? <Laugh size={20} /> : <Smile size={20} />;
        } else if (mood === 'neutral') {
            return isAnimating ? <Annoyed size={20} /> : <Meh size={20} />;
        } else {
            return isAnimating ? <Angry size={20} /> : <Frown size={20} />;
        }
    };

    return (
        <div className={styles.moodSection}>
            <div className={styles.moodContainer}>
                <button
                    className={`${styles.moodBtn} ${animatingMood === 'happy' ? styles.animateHappy : ''}`}
                    onClick={() => handleMoodClick('happy')}
                    aria-label="Rate as happy"
                    type="button"
                >
                    {getIcon('happy')}
                </button>
                <button
                    className={`${styles.moodBtn} ${animatingMood === 'neutral' ? styles.animateNeutral : ''}`}
                    onClick={() => handleMoodClick('neutral')}
                    aria-label="Rate as neutral"
                    type="button"
                >
                    {getIcon('neutral')}
                </button>
                <button
                    className={`${styles.moodBtn} ${animatingMood === 'sad' ? styles.animateSad : ''}`}
                    onClick={() => handleMoodClick('sad')}
                    aria-label="Rate as sad"
                    type="button"
                >
                    {getIcon('sad')}
                </button>
            </div>
        </div>
    );
};

