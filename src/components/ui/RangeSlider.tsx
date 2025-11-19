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
    allowTextInput?: boolean; // For year input
}

export const RangeSlider = ({
    min,
    max,
    minValue,
    maxValue,
    onChange,
    step = 1,
    formatLabel,
    unit = '',
    allowTextInput = false
}: RangeSliderProps) => {
    const [minVal, setMinVal] = useState<number>(minValue === '' ? min : Number(minValue));
    const [maxVal, setMaxVal] = useState<number>(maxValue === '' ? max : Number(maxValue));
    const [minInput, setMinInput] = useState<string>(minValue === '' ? String(min) : String(minValue));
    const [maxInput, setMaxInput] = useState<string>(maxValue === '' ? String(max) : String(maxValue));
    const [minError, setMinError] = useState<string>('');
    const [maxError, setMaxError] = useState<string>('');
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);
    const minInputRef = useRef<HTMLInputElement>(null);
    const maxInputRef = useRef<HTMLInputElement>(null);

    // Update local state when props change
    useEffect(() => {
        const newMin = minValue === '' ? min : Number(minValue);
        const newMax = maxValue === '' ? max : Number(maxValue);
        setMinVal(newMin);
        setMaxVal(newMax);
        setMinInput(String(newMin));
        setMaxInput(String(newMax));
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
        setMinInput(String(clampedValue));
        // Always pass the actual value for continuous filtering
        onChange(clampedValue, maxValue === '' ? max : maxValue);
    };

    const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(event.target.value), minVal + step);
        const clampedValue = Math.min(value, max);
        setMaxVal(clampedValue);
        setMaxInput(String(clampedValue));
        // Always pass the actual value for continuous filtering
        onChange(minValue === '' ? min : minValue, clampedValue);
    };

    const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const sliderElement = event.currentTarget;
        const rect = sliderElement.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const clickedValue = Math.round(min + (max - min) * percentage);
        const clampedValue = Math.max(min, Math.min(clickedValue, max));

        // Determine which value (min or max) is closer to the click
        const distanceToMin = Math.abs(clampedValue - minVal);
        const distanceToMax = Math.abs(clampedValue - maxVal);

        if (distanceToMin < distanceToMax) {
            // Update min value
            const newMin = Math.min(clampedValue, maxVal - step);
            const finalMin = Math.max(min, newMin);
            setMinVal(finalMin);
            setMinInput(String(finalMin));
            onChange(finalMin, maxValue === '' ? max : maxValue);
        } else {
            // Update max value
            const newMax = Math.max(clampedValue, minVal + step);
            const finalMax = Math.min(max, newMax);
            setMaxVal(finalMax);
            setMaxInput(String(finalMax));
            onChange(minValue === '' ? min : minValue, finalMax);
        }
    };

    const handleMinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMinInput(value);
        setMinError(''); // Clear error on input
        
        // Validate in real-time
        if (value !== '' && !isNaN(Number(value))) {
            const numValue = Number(value);
            if (numValue < min) {
                setMinError(`Min: ${min}`);
            } else if (numValue >= maxVal) {
                setMinError(`Må være < ${maxVal}`);
            } else {
                setMinError('');
            }
        }
    };

    const handleMaxInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMaxInput(value);
        setMaxError(''); // Clear error on input
        
        // Validate in real-time
        if (value !== '' && !isNaN(Number(value))) {
            const numValue = Number(value);
            if (numValue > max) {
                setMaxError(`Max: ${max}`);
            } else if (numValue <= minVal) {
                setMaxError(`Må være > ${minVal}`);
            } else {
                setMaxError('');
            }
        }
    };

    const handleMinInputBlur = () => {
        setMinError(''); // Clear error on blur
        if (minInput === '' || isNaN(Number(minInput))) {
            setMinInput(String(minVal));
        } else {
            const numValue = Number(minInput);
            const clampedValue = Math.max(min, Math.min(numValue, maxVal - step));
            setMinInput(String(clampedValue));
            setMinVal(clampedValue);
            // Always pass the actual value for continuous filtering
            onChange(clampedValue, maxValue === '' ? max : maxValue);
        }
    };

    const handleMaxInputBlur = () => {
        setMaxError(''); // Clear error on blur
        if (maxInput === '' || isNaN(Number(maxInput))) {
            setMaxInput(String(maxVal));
        } else {
            const numValue = Number(maxInput);
            const clampedValue = Math.min(max, Math.max(numValue, minVal + step));
            setMaxInput(String(clampedValue));
            setMaxVal(clampedValue);
            // Always pass the actual value for continuous filtering
            onChange(minValue === '' ? min : minValue, clampedValue);
        }
    };

    const formatValue = (value: number): string => {
        if (formatLabel) {
            return formatLabel(value);
        }
        return `${value}${unit ? ` ${unit}` : ''}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <div className={styles.inputGroup}>
                    <input
                        ref={minInputRef}
                        type={allowTextInput ? "text" : "number"}
                        className={`${styles.rangeInput} ${minError ? styles.rangeInputError : ''}`}
                        value={minInput}
                        onChange={handleMinInputChange}
                        onBlur={handleMinInputBlur}
                        min={min}
                        max={maxVal - step}
                        step={step}
                    />
                    <span className={styles.dash}>–</span>
                    <input
                        ref={maxInputRef}
                        type={allowTextInput ? "text" : "number"}
                        className={`${styles.rangeInput} ${maxError ? styles.rangeInputError : ''}`}
                        value={maxInput}
                        onChange={handleMaxInputChange}
                        onBlur={handleMaxInputBlur}
                        min={minVal + step}
                        max={max}
                        step={step}
                    />
                </div>
                {(minError || maxError) && (
                    <div className={styles.errorMessage}>
                        {minError && <span>{minError}</span>}
                        {minError && maxError && <span> • </span>}
                        {maxError && <span>{maxError}</span>}
                    </div>
                )}
            </div>
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
                <div className={styles.slider} onClick={handleTrackClick}>
                    <div className={styles.sliderTrack} />
                    <div ref={range} className={styles.sliderRange} />
                </div>
            </div>
        </div>
    );
};

