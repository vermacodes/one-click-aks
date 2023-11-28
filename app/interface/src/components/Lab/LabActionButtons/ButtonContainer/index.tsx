import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FaEllipsisV } from "react-icons/fa";
import { ButtonContainerObj } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";

type Props = {
  buttons: Record<string, ButtonContainerObj>;
  setButtons(args: Record<string, ButtonContainerObj>): void;
  overflowButtons: Record<string, ButtonContainerObj>;
  setOverflowButtons(args: Record<string, ButtonContainerObj>): void;
};

export default function ButtonContainer({
  buttons,
  setButtons,
  overflowButtons,
  setOverflowButtons,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnterDropdown = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  const onDropdownOpen = useCallback(() => {
    setShowDropdown(!showDropdown);
    const id = setTimeout(() => {
      setShowDropdown(false);
    }, 2000);
    setTimeoutId(id);
  }, []);

  useLayoutEffect(() => {
    if (hiddenButtonRef.current) {
      setButtonWidth(hiddenButtonRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = container?.offsetWidth;
      const allButtons = { ...overflowButtons, ...buttons };
      const buttonsArray = Object.entries(allButtons);
      buttonsArray.sort((a, b) => a[1].order - b[1].order);
      const sortedButtons = Object.fromEntries(buttonsArray);

      if (containerWidth && buttonWidth) {
        const maxButtons = Math.floor(containerWidth / buttonWidth);
        if (
          Object.keys(sortedButtons).length < maxButtons &&
          Object.keys(overflowButtons).length > 0
        ) {
          setButtons({ ...sortedButtons });
          setOverflowButtons({});
        }
        if (
          Object.keys(sortedButtons).length > maxButtons &&
          Object.keys(buttons).length !== maxButtons
        ) {
          setButtons(
            Object.fromEntries(
              Object.entries(sortedButtons).slice(0, maxButtons)
            )
          );

          setOverflowButtons(
            Object.fromEntries(Object.entries(sortedButtons).slice(maxButtons))
          );
        }
      }
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [buttonWidth, buttons, overflowButtons, containerRef]);

  return (
    <div className="flex w-full" ref={containerRef}>
      <div className="flex w-full justify-between">
        <div className="flex w-full gap-x-4">
          {Object.values(buttons).map((button) => button.button)}
        </div>
        {Object.values(overflowButtons).length > 0 && (
          <div className="relative inline-block text-left">
            <Button onClick={onDropdownOpen} variant="secondary-icon">
              <FaEllipsisV />
            </Button>
            {showDropdown && (
              <div
                className="space-2 absolute right-0 z-20 mt-2 flex w-fit flex-col gap-2 whitespace-nowrap rounded border border-slate-500 bg-slate-50 px-8 pb-6 pt-2 shadow-lg dark:bg-slate-900"
                onMouseLeave={() => setShowDropdown(false)}
                onMouseEnter={handleMouseEnterDropdown}
              >
                {Object.values(overflowButtons).map((button) => button.button)}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        ref={hiddenButtonRef}
        className="absolute -left-full  bg-blue-500 px-4 py-2"
      >
        This is a button
      </button>
    </div>
  );
}
