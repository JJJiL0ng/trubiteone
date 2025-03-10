//src/app/hooks/useBottomSheet.js
'use client';

import { useState, useCallback } from 'react';

/**
 * 바텀시트 상태 관리를 위한 훅
 */
const useBottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const openBottomSheet = useCallback((place) => {
    setSelectedPlace(place);
    setIsOpen(true);
  }, []);
  
  const closeBottomSheet = useCallback(() => {
    setIsOpen(false);
    // 약간의 딜레이 후 선택된 장소 상태 초기화 (애니메이션이 끝난 후)
    setTimeout(() => {
      setSelectedPlace(null);
    }, 300);
  }, []);
  
  return {
    isOpen,
    selectedPlace,
    openBottomSheet,
    closeBottomSheet
  };
};

export default useBottomSheet;