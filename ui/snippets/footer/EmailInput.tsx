import { chakra } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { domains } from 'lib/domains';
import { useColorModeValue } from 'toolkit/chakra/color-mode';
import { Input } from 'toolkit/chakra/input';

function EmailInput({ setEmail, email }: { email: string; setEmail: (email: string) => void }) {
  const [ suggestions, setSuggestions ] = useState<Array<string>>([]);
  const [ selectedSuggestion, setSelectedSuggestion ] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bgColor = useColorModeValue('white', 'black');

  useEffect(() => {
    // 当输入内容变化时生成建议
    if (!email) {
      setSuggestions([]);
      return;
    }

    // 检查是否已包含 @ 符号
    if (email.includes('@')) {
      const [ localPart, domainPart ] = email.split('@');
      // 过滤包含当前输入域名部分的建议
      const filtered = domains
        .filter(domain => domain.startsWith(domainPart))
        .map(domain => `${ localPart }${ domain }`);
      setSuggestions(filtered);
    } else {
      // 未包含 @ 符号时，生成完整邮箱建议
      const filtered = domains.map(domain => `${ email }${ domain }`);
      setSuggestions(filtered);
    }

    // 重置选中状态
    setSelectedSuggestion(-1);
  }, [ email ]);

  const handleChange = useCallback(function(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setEmail(value);
  }, [ setEmail ]);

  const selectSuggestion = useCallback(function(suggestion: string) {
    setEmail(suggestion);
    setSuggestions([]);
    if (inputRef && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [ setEmail ]);

  const handleSuggestionClick = useCallback(function(suggestion: string) {
    selectSuggestion(suggestion);
  }, [ selectSuggestion ]);

  const handleSuggestionMouseEnter = useCallback(function(index: number) {
    setSelectedSuggestion(index);
  }, []);

  return (
    <chakra.div position="relative" flex={ 1 }>
      <Input
        ref={ inputRef }
        type="text"
        value={ email }
        onChange={ handleChange }
        // onKeyDown={ handleKeyDown }
        placeholder="Please enter your email address"
        variant="outline"
        _focus={{
          borderColor: 'blue.500',
        }}
      />

      { suggestions.length > 0 && (
        <chakra.div bg={ bgColor } maxH="460px" overflowY="auto" position="absolute" zIndex="10" left="0" right="0" bottom="50px"
          borderWidth="1px" borderColor="gray.200" borderRadius="md" boxShadow="lg">
          { suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={ index }
              suggestion={ suggestion }
              onClick={ handleSuggestionClick }
              selected={ selectedSuggestion === index }
              onMouseEnter={ handleSuggestionMouseEnter }
              index={ index }
            />
          )) }
        </chakra.div>
      ) }
    </chakra.div>
  );
}

interface SuggestionItemProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
  selected: boolean;
  index: number;
  onMouseEnter: (index: number) => void;
}

function SuggestionItem({ suggestion, onClick, onMouseEnter, index }: SuggestionItemProps) {

  const handleClick = useCallback(() => {
    onClick(suggestion);
  }, [ onClick, suggestion ]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(index);
  }, [ onMouseEnter, index ]);

  return (
    <chakra.div
      onClick={ handleClick }
      onMouseEnter={ handleMouseEnter }
      paddingX="4"
      paddingY="2"
      cursor="pointer"
    >
      { suggestion }
    </chakra.div>
  );
}

export default EmailInput;
