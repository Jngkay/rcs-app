import React from 'react';
import { compareSpeech } from './compare_text';

export default function SpeechResult({ originalText, spokenText, duration, onSave, onRetry }) {
    if (!spokenText) return null;

    const diffResult = compareSpeech(originalText, spokenText);

    // Calculate some basic stats
    const totalOriginalWords = originalText.split(/\s+/).filter(w => w.length > 0).length;
    const missingWordsCount = diffResult.filter(part => part.removed).reduce((acc, part) => acc + part.value.trim().split(/\s+/).length, 0);
    const extraOrMispronouncedCount = diffResult.filter(part => part.added).reduce((acc, part) => acc + part.value.trim().split(/\s+/).length, 0);

    const miscuesCount = missingWordsCount + extraOrMispronouncedCount;
    const oralReadingScoreRaw = ((totalOriginalWords - miscuesCount) / totalOriginalWords) * 100;
    const oralReadingScore = Math.max(0, oralReadingScoreRaw).toFixed(1);

    // Calculate Reading Speed (Words Per Minute)
    const safeDuration = duration || 1; // avoid division by zero
    const wordsPerMinuteRaw = (totalOriginalWords / safeDuration) * 60;
    const readingSpeed = Math.round(wordsPerMinuteRaw);

    return (
        <div className="speech-result-container">
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">

                {/* Title */}
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                    Analysis Result
                </h3>

                {/* Divider */}
                <div className="border-t mb-6"></div>

                {/* Stats Box */}
                <div className="grid grid-cols-5 gap-4 bg-gray-50 border rounded-md p-6 text-center mb-6">
                    <div>
                        <p className="text-xs text-gray-500 tracking-wide">MISSING:</p>
                        <p className="text-2xl font-bold text-blue-700">{missingWordsCount}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 tracking-wide">
                            EXTRA:
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                            {extraOrMispronouncedCount}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 tracking-wide">MISCUES:</p>
                        <p className="text-2xl font-bold text-blue-700">{miscuesCount}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 tracking-wide">SCORE:</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {oralReadingScore}%
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 tracking-wide">SPEED:</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {readingSpeed} WPM
                        </p>
                    </div>
                </div>

                {/* Detailed Feedback */}
                <div className="border rounded-md p-5 mb-6">
                    <h4 className="text-blue-700 font-semibold mb-3">
                        Detailed Feedback:
                    </h4>

                    <p className="text-gray-700 leading-relaxed">
                        {diffResult.map((part, index) => {
                            // Missing words
                            if (part.removed) {
                                return (
                                    <span
                                        key={index}
                                        className="bg-red-500 text-white px-1 rounded mx-1"
                                        title="Missing Word"
                                    >
                                        {part.value}
                                    </span>
                                );
                            }

                            // Mispronounced / Extra
                            if (part.added) {
                                return (
                                    <span
                                        key={index}
                                        className="bg-yellow-400 text-white px-1 rounded mx-1"
                                        title="Mispronounced/Extra Word"
                                    >
                                        {part.value}
                                    </span>
                                );
                            }

                            // Match
                            return (
                                <span key={index} className="mx-1 text-gray-800">
                                    {part.value}
                                </span>
                            );
                        })}
                    </p>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-red-500 inline-block"></span>
                        <span>MISSING</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-yellow-400 inline-block"></span>
                        <span>MISPRONOUNCED/EXTRA</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 inline-block"></span>
                        <span>MATCH</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t mb-6"></div>

                {/* Raw Transcript */}
                <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded">
                    <h4 className="text-blue-700 font-semibold mb-2">
                        Raw Transcript:
                    </h4>
                    <p className="text-gray-700">{spokenText}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8">
                    <button 
                        onClick={onRetry} 
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full transition"
                    >
                        ⟳ RETRY
                    </button>
                    <button 
                        onClick={() => onSave(oralReadingScore, readingSpeed)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-lg"
                    >
                        💾 SAVE & PROCEED TO QUESTIONS
                    </button>
                </div>

            </div>
        </div>
    );
}
