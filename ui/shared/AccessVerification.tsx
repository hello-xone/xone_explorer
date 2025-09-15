import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

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
}: Props) => {
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);
  const [ isVerifying, setIsVerifying ] = React.useState(false);
  const [ verificationError, setVerificationError ] = React.useState<string | null>(null);
  const [ isVerified, setIsVerified ] = React.useState(false);
  const [ isRecaptchaLoaded, setIsRecaptchaLoaded ] = React.useState(false);
  const [ checkAttempts, setCheckAttempts ] = React.useState(0);
  const [ retryCount, setRetryCount ] = React.useState(0);

  // 主题适配颜色
  const bgOverlay = useColorModeValue('rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)');
  const modalBg = useColorModeValue('white', 'gray.800');
  const loadingBg = useColorModeValue('gray.50', 'gray.700');
  const loadingBorder = useColorModeValue('gray.200', 'gray.600');
  const loadingText = useColorModeValue('gray.600', 'gray.400');
  const recaptchaTheme = 'light';

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

  // 如果已经验证过，直接调用成功回调
  React.useEffect(() => {
    if (isAlreadyVerified) {
      onVerificationSuccess?.();
    }
  }, [ isAlreadyVerified, onVerificationSuccess ]);

  const handleReCaptchaChange = React.useCallback((token: string | null) => {
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

  const handleReCaptchaError = React.useCallback(() => {
    setVerificationError('reCAPTCHA failed to load. Please refresh the page and try again');
    onVerificationError?.(new Error('reCAPTCHA initialization failed'));
  }, [ onVerificationError ]);

  const handleReCaptchaExpired = React.useCallback(() => {
    setVerificationError('The verification has expired, please reverify');
    setIsVerified(false);
  }, []);

  // 检测 ReCAPTCHA 是否已加载完成
  const checkRecaptchaLoaded = React.useCallback(() => {
    const maxAttempts = 20; // 减少到20次（20秒）

    if (checkAttempts >= maxAttempts) {
      // 超时后直接显示reCAPTCHA，让用户尝试
      setIsRecaptchaLoaded(true);
      return;
    }

    setCheckAttempts(prev => prev + 1);

    try {
      // 简化的检测逻辑：只要window.grecaptcha存在就认为加载完成
      if (typeof window !== 'undefined') {
        const grecaptcha = (window as unknown as { grecaptcha?: unknown }).grecaptcha;
        if (grecaptcha) {
          setIsRecaptchaLoaded(true);
          return;
        }
      }

      // 检查DOM中是否有reCAPTCHA元素
      const recaptchaElement = document.querySelector('.g-recaptcha');
      if (recaptchaElement) {
        setIsRecaptchaLoaded(true);
        return;
      }

      // 检查是否有reCAPTCHA脚本
      const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
      if (recaptchaScript) {
        setIsRecaptchaLoaded(true);
        return;
      }

    } catch {}

    // 如果还没加载完成，继续检查
    setTimeout(checkRecaptchaLoaded, 1000);
  }, [ checkAttempts ]);

  // 启动 ReCAPTCHA 加载检测
  React.useEffect(() => {
    // 延迟一点时间再开始检测，给组件渲染时间
    const timer = setTimeout(() => {
      checkRecaptchaLoaded();
    }, 500);

    // 备用方案：3秒后强制显示reCAPTCHA
    const fallbackTimer = setTimeout(() => {
      if (!isRecaptchaLoaded) {
        setIsRecaptchaLoaded(true);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [ checkRecaptchaLoaded, isRecaptchaLoaded ]);

  const handleRetry = React.useCallback(() => {
    if (!enableRetry || retryCount >= maxRetryAttempts) {
      setVerificationError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setRetryCount(prev => prev + 1);
    setVerificationError(null);
    setIsVerified(false);
    setIsRecaptchaLoaded(false);
    setCheckAttempts(0);
    recaptchaRef.current?.reset();

    // 重新开始检测
    setTimeout(() => {
      checkRecaptchaLoaded();
    }, 500);
  }, [ checkRecaptchaLoaded, enableRetry, retryCount, maxRetryAttempts ]);

  if (isAlreadyVerified) {
    return null;
  }

  if (!config.services.reCaptchaV2.siteKey) {
    return (
      <Box position="fixed" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 } bg="rgba(0,0,0,0.8)" zIndex={ 9999 }>
        <Flex align="center" justify="center" h="100vh">
          <Box p={ 8 } maxW="400px" w="100%" bg="white" borderRadius="md" boxShadow="lg">
            <VStack gap={ 4 }>
              <IconSvg name="lock" boxSize={ 8 } color="red.500"/>
              <Text fontSize="lg" fontWeight={ 600 } textAlign="center">
                Restricted access
              </Text>
              <Text color="text.secondary" textAlign="center">
                The reCAPTCHA service is not configured, please contact the administrator
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box position="fixed" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 } bg={ bgOverlay } zIndex={ 9999 }>
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
              <Box position="relative" minH="78px" w="100%" maxW="304px" mx="auto">
                { !isRecaptchaLoaded && (
                  <Box
                    position="absolute"
                    top={ 0 }
                    left={ 0 }
                    right={ 0 }
                    bottom={ 0 }
                    bg={ loadingBg }
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor={ loadingBorder }
                    zIndex={ 1 }
                    w="100%"
                    h="100%"
                  >
                    <VStack gap={ 2 }>
                      <Box
                        w="20px"
                        h="20px"
                        border="2px solid"
                        borderColor="blue.200"
                        borderTopColor="blue.500"
                        borderRadius="50%"
                        animation="spin 1s linear infinite"
                      />
                      <Text fontSize="sm" color={ loadingText } textAlign="center">
                        Loading verification...
                      </Text>
                    </VStack>
                  </Box>
                ) }
                <Box w="100%" display="flex" justifyContent="center">
                  <ReCAPTCHA
                    ref={ recaptchaRef }
                    sitekey={ config.services.reCaptchaV2.siteKey }
                    onChange={ handleReCaptchaChange }
                    onErrored={ handleReCaptchaError }
                    onExpired={ handleReCaptchaExpired }
                    theme={ recaptchaTheme }
                    size="normal"
                    hl="en"
                  />
                </Box>
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
