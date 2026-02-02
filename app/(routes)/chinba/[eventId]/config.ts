// 정적 export를 위한 generateStaticParams
export async function generateStaticParams() {
  // test-event는 반드시 정적으로 생성
  return [
    {
      eventId: 'test-event',
    },
  ];
}

// 정적 export에서는 동적 파라미터 비활성화
export const dynamicParams = false;
