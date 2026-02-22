'use client';

import { FiUser, FiHome, FiBook, FiHash, FiMail } from 'react-icons/fi';

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
    email?: string;
    showNickname?: boolean;
    isReadonlyNickname?: boolean;
    isReadonlySchool?: boolean;
    isReadonly?: boolean;
    showRequirementBadges?: boolean;
    requirementMap?: Partial<Record<'nickname' | 'school' | 'dept_code' | 'admission_year', 'required' | 'optional'>>;
    invalidFields?: {
        school?: boolean;
        dept_code?: boolean;
        admission_year?: boolean;
    };
}

export default function UserInfoForm({
    formData,
    onChange,
    email,
    showNickname = true,
    isReadonlyNickname = false,
    isReadonlySchool = false,
    isReadonly = false,
    showRequirementBadges = false,
    requirementMap = {},
    invalidFields = {},
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

    const renderBadge = (key: 'nickname' | 'school' | 'dept_code' | 'admission_year') => {
        if (!showRequirementBadges) return null;
        const rule = requirementMap[key];
        if (rule !== 'optional') return null;
        return (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                선택
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* 닉네임 */}
            {showNickname && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiUser className="text-gray-400" />
                        닉네임
                        {renderBadge('nickname')}
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
                            : 'bg-gray-50 focus:border-gray-900 focus:bg-white'
                            }`}
                    />
                </div>
            )}

            {/* 이메일 (정보성, 읽기전용) */}
            {email && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FiMail className="text-gray-400" />
                        이메일
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-4 py-3 text-gray-500 bg-gray-100 border border-gray-200 outline-none cursor-not-allowed rounded-xl"
                    />
                </div>
            )}

            {/* 학교 */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiHome className="text-gray-400" />
                    학교
                    {renderBadge('school')}
                </label>
                <div className="relative">
                    <select
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        disabled={isReadonlySchool || isReadonly}
                        className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all ${(isReadonlySchool || isReadonly)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-medium'
                            : invalidFields.school
                                ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'bg-gray-50 focus:border-gray-900 focus:bg-white'
                            }`}
                    >
                        <option value="">{isReadonly ? '미설정' : '-- 학교를 선택하세요 --'}</option>
                        <option value="전북대">전북대학교</option>
                        <option value="기타">기타</option>
                    </select>
                    {!(isReadonlySchool || isReadonly) && (
                        <div className="absolute inset-y-0 flex items-center text-gray-400 pointer-events-none right-4">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* 학과 선택 */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiBook className="text-gray-400" />
                    학과
                    {renderBadge('dept_code')}
                </label>
                <DepartmentSearch
                    onSelect={handleDeptSelect}
                    selectedDeptCode={formData.dept_code}
                    placeholder="학과를 검색하세요"
                    isReadonly={isReadonly}
                    hasError={Boolean(invalidFields.dept_code)}
                />
            </div>

            {/* 학번 (입학년도) */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiHash className="text-gray-400" />
                    학번
                    {renderBadge('admission_year')}
                </label>
                <div className="relative">
                    <select
                        name="admission_year"
                        value={formData.admission_year}
                        onChange={handleInputChange}
                        disabled={isReadonly}
                        className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all ${isReadonly
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-medium'
                            : invalidFields.admission_year
                                ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'bg-gray-50 focus:border-gray-900 focus:bg-white'
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
                        <div className="absolute inset-y-0 flex items-center text-gray-400 pointer-events-none right-4">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
