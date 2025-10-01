import { Box, Flex } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';

import { Image } from 'toolkit/chakra/image';
import { Link } from 'toolkit/chakra/link';

interface AdItem {
  id: string;
  imageUrl: string;
  linkUrl: string;
}

interface Props {
  className?: string;
  ads: Array<AdItem>;
  autoPlayInterval?: number; // 自动播放间隔，默认5秒
  showDots?: boolean; // 是否显示指示点
  showArrows?: boolean; // 是否显示左右箭头
  transitionDuration?: number; // 切换动画持续时间（毫秒），默认500ms
}

const SimpleAdCarousel = ({
  className,
  ads,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  transitionDuration = 500,
}: Props) => {
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [ isHovered, setIsHovered ] = useState(false);

  // 自动播放逻辑
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === ads.length - 1 ? 0 : prevIndex + 1,
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [ ads.length, autoPlayInterval, isHovered ]);

  // 切换到指定索引
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 鼠标进入处理
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // 鼠标离开处理
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // 上一张
  const goToPrevious = useCallback(() => {
    setCurrentIndex(currentIndex === 0 ? ads.length - 1 : currentIndex - 1);
  }, [ currentIndex, ads.length ]);

  // 下一张
  const goToNext = useCallback(() => {
    setCurrentIndex(currentIndex === ads.length - 1 ? 0 : currentIndex + 1);
  }, [ currentIndex, ads.length ]);

  // 创建点击处理函数
  const createDotClickHandler = useCallback(
    (index: number) => {
      return () => goToSlide(index);
    },
    [ goToSlide ],
  );

  if (!ads || ads.length === 0) {
    return null;
  }

  const translateX = -currentIndex * (100 / ads.length);
  const transitionDurationSec = transitionDuration / 1000;

  return (
    <Box
      className={ className }
      position="relative"
      width="100%"
      maxW="728px"
      height="90px"
      overflow="hidden"
      borderRadius="8px"
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      bg="gray.100"
      boxShadow="md"
    >
      <Box
        fontSize="12px"
        w="36px"
        h="16px"
        textAlign="center"
        top={ 0 }
        right={ 0 }
        zIndex={ 1 }
        position="absolute"
        lineHeight="16px"
        borderRadius="0 8px 0 8px"
        background="#F2F3F4"
        color="#070808"
      >
        Ad
      </Box>
      { /* 轮播滑动容器 */ }
      <Box
        display="flex"
        width={ `${ ads.length * 100 }%` }
        height="100%"
        transform={ `translateX(${ translateX }%)` }
        transition={ `transform ${ transitionDurationSec }s cubic-bezier(0.4, 0, 0.2, 1)` }
      >
        { ads.map((ad, index) => (
          <Link
            key={ ad.id }
            href={ ad.linkUrl }
            external={ true }
            _hover={{ textDecoration: 'none' }}
            display="block"
            width={ `${ 100 / ads.length }%` }
            height="100%"
            flexShrink={ 0 }
          >
            <Box
              height="100%"
              transition="transform 0.3s ease"
              _hover={{ transform: 'scale(1.02)' }}
            >
              <Image
                src={ ad.imageUrl }
                alt={ `Advertisement ${ index + 1 }` }
                width="100%"
                height="100%"
                objectPosition="center"
                objectFit="cover"
              />
            </Box>
          </Link>
        )) }
      </Box>

      { /* 左右箭头导航 */ }
      { showArrows && ads.length > 1 && (
        <>
          <Box
            position="absolute"
            left={ 2 }
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
            onClick={ goToPrevious }
            bg="blackAlpha.600"
            color="white"
            borderRadius="full"
            width={ 8 }
            height={ 8 }
            display="flex"
            alignItems="center"
            justifyContent="center"
            opacity={ isHovered ? 1 : 0 }
            transition="all 0.3s ease"
            _hover={{
              bg: 'blackAlpha.800',
              transform: 'translateY(-50%) scale(1.1)',
            }}
            zIndex={ 2 }
            fontSize="lg"
            fontWeight="bold"
          >
            ‹
          </Box>
          <Box
            position="absolute"
            right={ 2 }
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
            onClick={ goToNext }
            bg="blackAlpha.600"
            color="white"
            borderRadius="full"
            width={ 8 }
            height={ 8 }
            display="flex"
            alignItems="center"
            justifyContent="center"
            opacity={ isHovered ? 1 : 0 }
            transition="all 0.3s ease"
            _hover={{
              bg: 'blackAlpha.800',
              transform: 'translateY(-50%) scale(1.1)',
            }}
            zIndex={ 2 }
            fontSize="lg"
            fontWeight="bold"
          >
            ›
          </Box>
        </>
      ) }

      { /* 指示点 */ }
      { showDots && ads.length > 1 && (
        <Flex
          position="absolute"
          bottom={ 2 }
          justifyContent="center"
          width="100%"
          gap={ 1 }
          zIndex={ 2 }
        >
          { ads.map((_, index) => (
            <Box
              key={ index }
              width={ 2.5 }
              height={ 2.5 }
              borderRadius="full"
              bg={ index === currentIndex ? '#FF0420' : 'whiteAlpha.600' }
              cursor="pointer"
              onClick={ createDotClickHandler(index) }
              transition="all 0.3s ease"
              _hover={{
                bg: index === currentIndex ? '#FF0420' : 'whiteAlpha.800',
                transform: 'scale(1.2)',
              }}
              border={ index === currentIndex ? '1px solid' : 'none' }
              borderColor={ index === currentIndex ? '#FF0420' : 'transparent' }
            />
          )) }
        </Flex>
      ) }
    </Box>
  );
};

export default SimpleAdCarousel;
