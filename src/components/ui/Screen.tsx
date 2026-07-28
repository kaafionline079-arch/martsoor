import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';

type ScreenScrollApi = {
  scrollToEnd: (animated?: boolean) => void;
  scrollBy: (y: number, animated?: boolean) => void;
};

const ScreenScrollContext = createContext<ScreenScrollApi | null>(null);

export function useScreenScroll() {
  return useContext(ScreenScrollContext);
}

type Props = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  /** Wrap scroll in KeyboardAvoidingView — use for forms */
  keyboard?: boolean;
  padded?: boolean;
  bottomPadding?: number;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  padded = true,
  bottomPadding = 120,
  edges = ['top', 'left', 'right'],
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!keyboard) return;

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboard]);

  const scrollApi: ScreenScrollApi = {
    scrollToEnd: (animated = true) => {
      scrollRef.current?.scrollToEnd({ animated });
    },
    scrollBy: (y, animated = true) => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, scrollYRef.current + y),
        animated,
      });
    },
  };

  const content = (
    <View style={[{ paddingHorizontal: padded ? 20 : 0 }, style]} {...rest}>
      {children}
    </View>
  );

  const extraBottom = keyboard ? Math.max(keyboardHeight - 40, 0) : 0;

  const scrollView = (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: bottomPadding + extraBottom,
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
      automaticallyAdjustKeyboardInsets={keyboard}
      onScroll={(e) => {
        scrollYRef.current = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      {content}
    </ScrollView>
  );

  const body = scroll ? (
    keyboard ? (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        {scrollView}
      </KeyboardAvoidingView>
    ) : (
      scrollView
    )
  ) : (
    <View style={{ flex: 1 }}>{content}</View>
  );

  return (
    <ScreenScrollContext.Provider value={scroll ? scrollApi : null}>
      <SafeAreaView
        edges={edges}
        style={{ flex: 1, backgroundColor: theme.background }}
      >
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {body}
      </SafeAreaView>
    </ScreenScrollContext.Provider>
  );
}
