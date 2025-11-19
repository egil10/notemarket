'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './RangeSlider.module.css';

interface RangeSliderProps {
    min: number;
    max: number;
    minValue: number | '';
    maxValue: number | '';
    onChange: (min: number | '', max: number | '') => void;
    step?: number;
    formatLabel?: (value: number) => string;
    unit?: string;
}

export const RangeSlider = ({
    min,
    max,
    minValue,
    maxValue,
    onChange,
    step = 1,
    formatLabel,
    unit = ''
}: RangeSliderProps) => {
    const [minVal, setMinVal] = useState<number>(minValue === '' ? min : Number(minValue));
    const [maxVal, setMaxVal] = useState<number>(maxValue === '' ? max : Number(maxValue));
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    // Update local state when props change
    useEffect(() => {
        setMinVal(minValue === '' ? min : Number(minValue));
        setMaxVal(maxValue === '' ? max : Number(maxValue));
    }, [minValue, maxValue, min, max]);

    // Convert to percentage
    const getPercent = (value: number) => {
        if (max === min) return 0;
        return Math.round(((value - min) / (max - min)) * 100);
    };

    // Update range position and width
    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxVal);

            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, maxVal, min, max]);

    const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(event.target.value), maxVal - step);
        const clampedValue = Math.max(value, min);
        setMinVal(clampedValue);
        onChange(clampedValue === min ? '' : clampedValue, maxValue);
    };

    const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(event.target.value), minVal + step);
        const clampedValue = Math.min(value, max);
        setMaxVal(clampedValue);
        onChange(minValue, clampedValue === max ? '' : clampedValue);
    };

    const formatValue = (value: number): string => {
        if (formatLabel) {
            return formatLabel(value);
        }
        return `${value}${unit ? ` ${unit}` : ''}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.sliderContainer}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    step={step}
                    onChange={handleMinChange}
                    className={`${styles.thumb} ${styles.thumbLeft}`}
                    ref={minValRef}
                    style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    step={step}
                    onChange={handleMaxChange}
                    className={`${styles.thumb} ${styles.thumbRight}`}
                    ref={maxValRef}
                />
                <div className={styles.slider}>
                    <div className={styles.sliderTrack} />
                    <div ref={range} className={styles.sliderRange} />
                </div>
            </div>
            <div className={styles.valueDisplay}>
                <div className={styles.valueBox}>
                    <span className={styles.valueLabel}>Min</span>
                    <span className={styles.valueText}>
                        {minVal === min ? 'Ingen' : formatValue(minVal)}
                    </span>
                </div>
                <div className={styles.valueSeparator}>–</div>
                <div className={styles.valueBox}>
                    <span className={styles.valueLabel}>Maks</span>
                    <span className={styles.valueText}>
                        {maxVal === max ? 'Ingen' : formatValue(maxVal)}
                    </span>
                </div>
            </div>
        </div>
    );
};

