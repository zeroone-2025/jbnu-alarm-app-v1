'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useUpdateUser } from '@/_lib/hooks/useUser';
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import { FiEdit3, FiUser } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { getAllDepartments } from '@/_lib/api';
import { useToast } from '@/_context/ToastContext';
import ProfileTabs, { ProfileTabType } from './ProfileTabs';
import { TimetableTab } from '@/_components/timetable';
import CareerTab from './career/CareerTab';

function formatAdmissionYear(year: number | null | undefined): string | null {
  if (!year) return null;
  return `${String(year).slice(-2)}학번`;
}

export default function ProfileClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoggedIn, isAuthLoaded, isLoading: isUserLoading } = useUser();
  const updateMutation = useUpdateUser();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const initialTab = (searchParams.get('tab') as ProfileTabType) || 'basic';
  const [activeTab, setActiveTab] = useState<ProfileTabType>(initialTab);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTabRef = useRef<ProfileTabType>(initialTab);

  const TAB_INDEX: Record<ProfileTabType, number> = { basic: 0, timetable: 1, career: 2 };

  const [formData, setFormData] = useState<UserInfoFormData>({
    nickname: '',
    school: '',
    dept_code: '',
    dept_name: '',
    admission_year: '',
  });

  const [deptName, setDeptName] = useState<string | null>(null);
  const admissionYearText = formatAdmissionYear(user?.admission_year);

  useEffect(() => {
    if (!user?.dept_code) {
      setDeptName(null);
      return;
    }
    getAllDepartments(true)
      .then((depts) => {
        const found = depts.find((d) => d.dept_code === user.dept_code);
        setDeptName(found?.dept_name || null);
      })
      .catch(() => setDeptName(null));
  }, [user?.dept_code]);

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        school: user.school || '',
        dept_code: user.dept_code || '',
        dept_name: '',
        admission_year: user.admission_year ? user.admission_year.toString() : '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoaded && !isLoggedIn) {
      router.replace('/');
    }
  }, [isAuthLoaded, isLoggedIn, router]);

  const handleFormChange = (data: Partial<UserInfoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        school: user.school || '',
        dept_code: user.dept_code || '',
        dept_name: '',
        admission_year: user.admission_year ? user.admission_year.toString() : '',
      });
    }
    setIsEditing(false);
  };

  const handleTabChange = (tab: ProfileTabType) => {
    if (tab === activeTab) return;
    const direction = TAB_INDEX[tab] > TAB_INDEX[activeTab] ? 'right' : 'left';
    setSlideDirection(direction);
    setIsAnimating(true);
    prevTabRef.current = activeTab;
    setActiveTab(tab);
    if (isEditing) setIsEditing(false);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        nickname: formData.nickname,
        school: formData.school,
        dept_code: formData.dept_code,
        admission_year: formData.admission_year ? parseInt(formData.admission_year) : undefined,
      });
      showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      showToast('업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  if (!isAuthLoaded || isUserLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center gap-4 px-5 py-6">
        {user?.profile_image ? (
          <img
            src={user.profile_image}
            alt={user.nickname || '사용자'}
            className="h-20 w-20 rounded-full border border-gray-100 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-100 bg-gray-50">
            <FiUser className="text-gray-400" size={32} />
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-lg leading-tight font-bold text-gray-800">
            {user?.nickname || '사용자'}
          </p>
          <p className="mt-1 text-xs text-gray-400">{user?.email}</p>
          {(user?.school || deptName || admissionYearText) && (
            <p className="mt-0.5 text-xs text-gray-400">
              {[user?.school, deptName, admissionYearText].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0">
        <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tab content with slide animation */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          key={activeTab}
          className={`h-full ${
            isAnimating
              ? slideDirection === 'right'
                ? 'animate-slideInRight'
                : 'animate-slideInLeft'
              : ''
          }`}
          onAnimationEnd={() => setIsAnimating(false)}
        >
          <div className="h-full overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="px-5 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <UserInfoForm
                    formData={formData}
                    onChange={handleFormChange}
                    email={user?.email}
                    showNickname={true}
                    isReadonlyNickname={true}
                    isReadonly={!isEditing}
                  />

                  <div className="mb-4 flex justify-end">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-900 transition-all hover:bg-gray-200 active:scale-95"
                      >
                        <FiEdit3 size={14} />
                        수정하기
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-all hover:bg-gray-200 active:scale-95"
                      >
                        취소
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="animate-slide-up pt-4">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        fullWidth
                        size="lg"
                        className="shadow-lg active:scale-95"
                      >
                        {updateMutation.isPending ? '저장 중...' : '저장하기'}
                      </Button>
                    </div>
                  )}

                </form>
              </div>
            )}

            {activeTab === 'timetable' && (
              <div className="h-full">
                <TimetableTab />
              </div>
            )}

            {activeTab === 'career' && (
              <div className="h-full">
                <CareerTab onShowToast={showToast} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
