'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiTrash2, FiUpload, FiUser } from 'react-icons/fi';
import { useUpdateUser, useUploadUserProfileImage } from '@/_lib/hooks/useUser';
import UserInfoForm, { type UserInfoFormData } from '@/_components/auth/UserInfoForm';
import type { UserProfile } from '@/_types/user';
import { FormFooter } from './formUi';

interface Props {
  user: UserProfile | null;
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

export default function ProfileEditForm({
  user,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const update = useUpdateUser();
  const uploadImage = useUploadUserProfileImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profile_image ?? '');
  const [removeImage, setRemoveImage] = useState(false);
  const [info, setInfo] = useState<UserInfoFormData>({
    nickname: user?.nickname ?? '',
    username: user?.username ?? '',
    school: user?.school ?? '',
    dept_code: user?.dept_code ?? '',
    dept_name: '',
    admission_year: user?.admission_year ? String(user.admission_year) : '',
  });

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('이미지 파일만 업로드할 수 있어요');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('프로필 이미지는 5MB 이하만 업로드할 수 있어요');
      return;
    }

    setSelectedFile(file);
    setRemoveImage(false);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setRemoveImage(true);
  };

  const submit = async () => {
    try {
      let uploadedImage: string | undefined;
      if (selectedFile) {
        const uploadedUser = await uploadImage.mutateAsync(selectedFile);
        uploadedImage = uploadedUser.profile_image ?? undefined;
      }

      await update.mutateAsync({
        nickname: info.nickname || undefined,
        school: info.school || undefined,
        dept_code: info.dept_code || undefined,
        admission_year: info.admission_year ? parseInt(info.admission_year, 10) : undefined,
        profile_image: removeImage ? null : uploadedImage,
      });
      onSaveSuccess();
    } catch {
      onError('프로필 저장에 실패했어요');
    }
  };

  const isSaving = update.isPending || uploadImage.isPending;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {/* Profile image */}
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-600">프로필 사진</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50"
              aria-label="프로필 사진 등록"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // 깨진 이미지일 때 fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <FiUser size={28} className="text-gray-400" />
              )}
              <span className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-black/55 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <FiCamera size={14} />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
                >
                  <FiUpload size={13} />
                  {previewUrl ? '사진 변경' : '사진 등록'}
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-200 hover:text-red-500"
                  >
                    <FiTrash2 size={13} />
                    삭제
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                jpg, png, webp 파일을 등록할 수 있어요. 정사각형 사진을 추천합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <UserInfoForm
          formData={info}
          onChange={(patch) => setInfo((prev) => ({ ...prev, ...patch }))}
          email={user?.email}
          showNickname
          showUsername={false}
        />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={isSaving} />
    </div>
  );
}
