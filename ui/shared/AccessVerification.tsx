import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import React from 'react';

import config from 'configs/app';
import { Alert } from 'toolkit/chakra/alert';
import { Button } from 'toolkit/chakra/button';
import { useColorModeValue } from 'toolkit/chakra/color-mode';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: Error) => void;
  title?: string;
  description?: string;
  // 管理配置
  enableLocalStorage?: boolean; // 是否启用本地存储
  verificationDuration?: number; // 验证有效期（毫秒）
  enableRetry?: boolean; // 是否启用重试功能
  maxRetryAttempts?: number; // 最大重试次数
  // Loading 时间控制
  minLoadingTime?: number; // 最小加载时间（毫秒）
  maxLoadingTime?: number; // 最大加载时间（毫秒）
  // 自适应 loading 配置
  adaptiveLoading?: boolean; // 是否启用自适应 loading
  loadingMode?: 'fast' | 'normal' | 'slow' | 'custom'; // loading 模式
  customLoadingTime?: number; // 自定义 loading 时间
}

const AccessVerification = ({
  onVerificationSuccess,
  onVerificationError,
  title = 'Man Machine Verification',
  description = 'In order to ensure the security of the website, please complete the man-machine verification',
  enableLocalStorage = true,
  verificationDuration = 24 * 60 * 60 * 1000, // 默认24小时
  enableRetry = true,
  maxRetryAttempts = 3,
  minLoadingTime = 1500, // 默认最小加载时间 1.5 秒
  maxLoadingTime = 8000, // 默认最大加载时间 8 秒
  adaptiveLoading = true, // 默认启用自适应 loading
  loadingMode = 'normal', // 默认正常模式
  customLoadingTime = 2000, // 默认自定义时间 2 秒
}: Props) => {
  const turnstileRef = React.useRef<TurnstileInstance>(null);
  const [ isVerifying, setIsVerifying ] = React.useState(false);
  const [ verificationError, setVerificationError ] = React.useState<string | null>(null);
  const [ isVerified, setIsVerified ] = React.useState(false);
  const [ retryCount, setRetryCount ] = React.useState(0);
  const [ isTurnstileLoaded, setIsTurnstileLoaded ] = React.useState(false);
  const [ showTurnstile, setShowTurnstile ] = React.useState(false);

  // 主题适配颜色
  const bgOverlay = useColorModeValue('rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)');
  const modalBg = useColorModeValue('white', 'gray.800');

  // 自适应 loading 时间计算
  const calculateAdaptiveLoadingTime = React.useCallback(() => {
    if (!adaptiveLoading) {
      return minLoadingTime;
    }

    // 基于内容长度计算基础时间
    const titleLength = title.length;
    const descriptionLength = description.length;
    const contentComplexity = titleLength + descriptionLength;

    // 基于内容复杂度的基础时间
    let baseTime = 800; // 基础时间 800ms

    // 根据内容长度调整
    if (contentComplexity > 100) {
      baseTime += 400; // 长内容增加 400ms
    } else if (contentComplexity > 50) {
      baseTime += 200; // 中等内容增加 200ms
    }

    // 根据 loading 模式调整
    switch (loadingMode) {
      case 'fast':
        baseTime = Math.min(baseTime, 1000);
        break;
      case 'normal':
        baseTime = Math.max(baseTime, 1200);
        break;
      case 'slow':
        baseTime = Math.max(baseTime, 2000);
        break;
      case 'custom':
        baseTime = customLoadingTime;
        break;
    }

    // 确保在合理范围内
    return Math.max(minLoadingTime, Math.min(maxLoadingTime, baseTime));
  }, [ adaptiveLoading, title, description, loadingMode, customLoadingTime, minLoadingTime, maxLoadingTime ]);

  // 检查是否已经验证过（可配置有效期）
  const isAlreadyVerified = React.useMemo(() => {
    if (!enableLocalStorage) {
      return false;
    }

    const verified = localStorage.getItem('access_verified');
    const timestamp = localStorage.getItem('access_verified_timestamp');

    if (!verified || !timestamp) {
      return false;
    }

    const verifiedTime = parseInt(timestamp);
    const now = Date.now();

    return (now - verifiedTime) < verificationDuration;
  }, [ enableLocalStorage, verificationDuration ]);

  // 禁用页面滚动
  React.useEffect(() => {
    // 保存原始overflow样式
    const originalOverflow = document.body.style.overflow;

    // 禁用滚动
    document.body.style.overflow = 'hidden';

    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // 延迟加载 Turnstile 组件
  React.useEffect(() => {
    if (isAlreadyVerified) {
      return;
    }

    const startTime = Date.now();
    const adaptiveTime = calculateAdaptiveLoadingTime();

    // 延迟 500ms 后开始加载 Turnstile
    const timer = setTimeout(() => {
      setIsTurnstileLoaded(true);

      // 计算剩余的自适应加载时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, adaptiveTime - elapsedTime);

      // 如果已经超过了最小加载时间，立即显示
      if (remainingTime <= 0) {
        setShowTurnstile(true);
      } else {
        // 否则等待剩余时间，但最多等待 500ms（减少空白时间）
        const maxWaitTime = Math.min(remainingTime, 500);
        setTimeout(() => {
          setShowTurnstile(true);
        }, maxWaitTime);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ isAlreadyVerified, calculateAdaptiveLoadingTime ]);

  // 如果已经验证过，直接调用成功回调
  React.useEffect(() => {
    if (isAlreadyVerified) {
      onVerificationSuccess?.();
    }
  }, [ isAlreadyVerified, onVerificationSuccess ]);

  const handleTurnstileChange = React.useCallback((token: string | null) => {
    if (token) {
      setIsVerifying(true);
      setVerificationError(null);

      setTimeout(() => {
        setIsVerified(true);
        setIsVerifying(false);

        // 设置验证成功的标记到localStorage（如果启用）
        if (enableLocalStorage) {
          localStorage.setItem('access_verified', 'true');
          localStorage.setItem('access_verified_timestamp', Date.now().toString());
        }

        onVerificationSuccess?.();
      }, 1000);
    } else {
      setVerificationError('Please complete the man-machine verification');
      setIsVerified(false);
    }
  }, [ onVerificationSuccess, enableLocalStorage ]);

  // Turnstile 组件加载完成回调
  const handleTurnstileLoad = React.useCallback(() => {
    // Turnstile 组件已加载完成，立即显示
    setShowTurnstile(true);
  }, []);

  const handleTurnstileError = React.useCallback(() => {
    setVerificationError('Cloudflare Turnstile failed to load. Please refresh the page and try again');
    onVerificationError?.(new Error('Cloudflare Turnstile initialization failed'));
  }, [ onVerificationError ]);

  const handleTurnstileExpired = React.useCallback(() => {
    setVerificationError('The verification has expired, please reverify');
    setIsVerified(false);
  }, []);

  // Turnstile 组件会自动处理加载

  const handleRetry = React.useCallback(() => {
    if (!enableRetry || retryCount >= maxRetryAttempts) {
      setVerificationError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setRetryCount(prev => prev + 1);
    setVerificationError(null);
    setIsVerified(false);
    setIsTurnstileLoaded(false);
    setShowTurnstile(false);

    // 延迟重新加载 Turnstile
    const retryStartTime = Date.now();
    const adaptiveTime = calculateAdaptiveLoadingTime();

    setTimeout(() => {
      setIsTurnstileLoaded(true);

      // 计算重试时的剩余自适应加载时间
      const elapsedTime = Date.now() - retryStartTime;
      const remainingTime = Math.max(0, adaptiveTime - elapsedTime);

      // 如果已经超过了最小加载时间，立即显示
      if (remainingTime <= 0) {
        setShowTurnstile(true);
        turnstileRef.current?.reset();
      } else {
        // 否则等待剩余时间，但最多等待 300ms（重试时更快）
        const maxWaitTime = Math.min(remainingTime, 300);
        setTimeout(() => {
          setShowTurnstile(true);
          turnstileRef.current?.reset();
        }, maxWaitTime);
      }
    }, 300);
  }, [ enableRetry, retryCount, maxRetryAttempts, calculateAdaptiveLoadingTime ]);

  const renderTurnstileContent = React.useCallback(() => {
    if (!isTurnstileLoaded) {
      return (
        <VStack gap={ 2 }>
          <Box
            w="8"
            h="8"
            border="2px solid"
            borderColor="blue.200"
            borderTopColor="blue.500"
            borderRadius="50%"
            animation="spin 1s linear infinite"
          />
          <Text fontSize="sm" color="text.secondary">
            Loading verification...
          </Text>
        </VStack>
      );
    }

    if (showTurnstile) {
      return (
        <Box position="relative" zIndex={ 10000 }>
          <Turnstile
            ref={ turnstileRef }
            siteKey={ config.services.cloudflareTurnstile.siteKey! }
            onSuccess={ handleTurnstileChange }
            onError={ handleTurnstileError }
            onExpire={ handleTurnstileExpired }
            onLoad={ handleTurnstileLoad }
            options={{
              language: 'en',
            }}
          />
        </Box>
      );
    }

    // 中间状态：已加载但还未显示 Turnstile
    return (
      <VStack gap={ 2 }>
        <Box
          w="6"
          h="6"
          border="2px solid"
          borderColor="green.200"
          borderTopColor="green.500"
          borderRadius="50%"
          animation="spin 0.8s linear infinite"
        />
        <Text fontSize="sm" color="green.500">
          Preparing verification...
        </Text>
      </VStack>
    );
  }, [ isTurnstileLoaded, showTurnstile, handleTurnstileChange, handleTurnstileError, handleTurnstileExpired, handleTurnstileLoad ]);

  if (isAlreadyVerified) {
    return null;
  }

  if (!config.services.cloudflareTurnstile.siteKey) {
    return (
      <Box position="fixed" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 } bg="rgba(0,0,0,0.8)" zIndex={ 10001 }>
        <Flex align="center" justify="center" h="100vh">
          <Box p={ 8 } maxW="400px" w="100%" bg="white" borderRadius="md" boxShadow="lg">
            <VStack gap={ 4 }>
              <IconSvg name="lock" boxSize={ 8 } color="red.500"/>
              <Text fontSize="lg" fontWeight={ 600 } textAlign="center">
                Restricted access
              </Text>
              <Text color="text.secondary" textAlign="center">
                The Cloudflare Turnstile service is not configured, please contact the administrator
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box position="fixed" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 } bg={ bgOverlay } zIndex={ 10001 }>
      <Flex align="center" justify="center" h="100vh">
        <Box p={ 8 } maxW="400px" w="100%" bg={ modalBg } borderRadius="md" boxShadow="lg">
          <VStack gap={ 6 }>
            <VStack gap={ 3 }>
              <IconSvg name="lock" boxSize={ 8 } color="blue.500"/>
              <Text fontSize="lg" fontWeight={ 600 } textAlign="center">
                { title }
              </Text>
              <Text color="text.secondary" textAlign="center">
                { description }
              </Text>
            </VStack>

            { verificationError && (
              <Alert status="error" w="100%">
                { verificationError }
              </Alert>
            ) }

            { isVerified && (
              <Alert status="success" w="100%">
                Verify success! Entering the website...
              </Alert>
            ) }

            <VStack gap={ 4 } w="100%">
              <Box w="100%" display="flex" justifyContent="center" minH="65px">
                { renderTurnstileContent() }
              </Box>

              { verificationError && enableRetry && retryCount < maxRetryAttempts && (
                <Button
                  onClick={ handleRetry }
                  w="100%"
                  size="md"
                  colorScheme="blue"
                  variant="outline"
                >
                  Revalidate ({ retryCount + 1 }/{ maxRetryAttempts })
                </Button>
              ) }

              { isVerifying && (
                <Text fontSize="sm" color="blue.500" textAlign="center">
                  Under verification...
                </Text>
              ) }
            </VStack>

            <Text fontSize="sm" color="text.secondary" textAlign="center">
              There is no need to repeat the verification within 24 hours after passing the verification
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default AccessVerification;
