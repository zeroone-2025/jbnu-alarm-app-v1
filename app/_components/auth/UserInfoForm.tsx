'use client';

import { FiUser, FiHome, FiBook, FiHash } from 'react-icons/fi';
import DepartmentSearch from '@/_components/ui/DepartmentSearch';
import type { Department } from '@/_types/department';

export interface UserInfoFormData {
    nickname: string;
    school: string;
    dept_code: string;
    dept_name: string;
    admission_year: string;
}

interface UserInfoFormProps {
    formData: UserInfoFormData;
    onChange: (data: Partial<UserInfoFormData>) => void;
    showNickname?: boolean;
    isReadonlyNickname?: boolean;
    isReadonlySchool?: boolean;
    isReadonly?: boolean;
}

export default function UserInfoForm({
    formData,
    onChange,
    showNickname = true,
    isReadonlyNickname = false,
    isReadonlySchool = false,
    isReadonly = false,
}: UserInfoFormProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({ [name]: value });
    };

    const handleDeptSelect = (dept: Department | null) => {
        onChange({
            dept_code: dept?.dept_code || '',
            dept_name: dept?.dept_name || '',
        });
    };

    return (
        <div className="space-y-6">
            {/* 닉네임 */}
            {showNickname && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiUser className="text-blue-500" />
                        닉네임
                    </label>
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        readOnly={isReadonlyNickname || isReadonly}
                        placeholder="닉네임을 입력하세요"
                        className={`w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all ${(isReadonlyNickname || isReadonly)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-50 focus:border-blue-500 focus:bg-white'
                            }`}
                    />
                </div>
            )}

            {/* 학교 */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiHome className="text-blue-500" />
                    학교
                </label>
                <div className="relative">
                    <select
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        disabled={isReadonlySchool || isReadonly}
                        className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all ${(isReadonlySchool || isReadonly)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-medium'
                            : 'bg-gray-50 focus:border-blue-500 focus:bg-white'
                            }`}
                    >
                        <option value="전북대">전북대학교</option>
                        <option value="기타">기타</option>
                    </select>
                    {!(isReadonlySchool || isReadonly) && (
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* 학과 선택 */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiBook className="text-blue-500" />
                    학과
                </label>
                <DepartmentSearch
                    onSelect={handleDeptSelect}
                    selectedDeptCode={formData.dept_code}
                    placeholder="학과를 검색하세요"
                    isReadonly={isReadonly}
                />
            </div>

            {/* 학분 (입학년도) */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiHash className="text-blue-500" />
                    학번 (입학년도)
                </label>
                <div className="relative">
                    <select
                        name="admission_year"
                        value={formData.admission_year}
                        onChange={handleInputChange}
                        disabled={isReadonly}
                        className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all ${isReadonly
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-medium'
                            : 'bg-gray-50 focus:border-blue-500 focus:bg-white'
                            }`}
                    >
                        <option value="">{isReadonly ? '미설정' : '-- 학번을 선택하세요 --'}</option>
                        {Array.from({ length: 17 }, (_, i) => 26 - i).map((year) => (
                            <option key={year} value={year.toString()}>
                                {year}학번
                            </option>
                        ))}
                    </select>
                    {!isReadonly && (
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
