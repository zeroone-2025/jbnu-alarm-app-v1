'use client';

import { useEffect, useState } from 'react';
import { PiDotsThreeOutlineVerticalFill, PiCompassFill, PiShareNetworkFill } from 'react-icons/pi';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { getSystemType, isInAppBrowser, UserSystemType } from '@/_lib/utils/external-browser';

export default function InAppBrowserGuideModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [systemType, setSystemType] = useState<UserSystemType>('unknown');
    const [copied, setCopied] = useState(false);
    const SITE_URL = 'https://zerotime.kr';

    useEffect(() => {
        if (isInAppBrowser()) {
            setSystemType(getSystemType());
            setIsVisible(true);
            // Try to prevent scrolling on the body behind the modal
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(SITE_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for some in-app browsers that block clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = SITE_URL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 bg-blue-50">
                    <h2 className="text-xl font-bold text-center text-blue-900 break-keep">
                        더 원활한 사용을 위해<br />
                        <span className="text-blue-600">외부 브라우저</span>로 열어주세요!
                    </h2>
                    <p className="mt-2 text-sm text-center text-blue-700/80 break-keep">
                        구글 로그인 등 주요 기능이<br />
                        인앱 브라우저에서 제한될 수 있습니다.
                    </p>
                </div>

                {/* Action Guide */}
                <div className="p-6 space-y-6">

                    {/* 1. Android Guide */}
                    {systemType === 'android' && (
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm text-gray-600">
                                <PiDotsThreeOutlineVerticalFill size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">1. 메뉴 버튼 클릭</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    화면 우측 상단의 <span className="font-medium text-gray-700">점 3개 아이콘</span>을 찾아 눌러주세요.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 1. iOS Guide */}
                    {systemType === 'ios' && (
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm text-gray-600">
                                <PiCompassFill size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">1. 사파리/브라우저로 열기</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    하단나 상단의 <span className="font-medium text-gray-700">사파리 아이콘</span>이나 <span className="font-medium text-gray-700">공유/메뉴</span> 버튼을 눌러주세요.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Common Instruction */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm text-gray-600">
                            <PiShareNetworkFill size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">2. '다른 브라우저로 열기' 선택</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                (Chrome, Samsung Internet, Safari 등)
                            </p>
                        </div>
                    </div>


                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Copy Link Section */}
                    <div className="text-center">
                        <p className="mb-3 text-sm font-medium text-gray-500">
                            링크를 복사해서 브라우저 주소창에 붙여넣으세요
                        </p>
                        <button
                            onClick={handleCopyLink}
                            data-active={copied}
                            className="group relative flex items-center justify-center w-full gap-2 px-4 py-3.5 text-sm font-semibold text-gray-700 transition-all bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 active:scale-95"
                        >
                            {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                            <span>{copied ? '복사되었습니다!' : '링크 복사하기'}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
