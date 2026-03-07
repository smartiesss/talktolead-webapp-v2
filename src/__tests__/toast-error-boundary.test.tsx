/**
 * W8: Toast notification system + Error Boundary tests
 * Coverage: Toast component, Toaster, ToastProvider, useToast hook, ErrorBoundary
 */

import React from "react"
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"

// ─── Toast component tests ────────────────────────────────────────────────────

import { Toast, Toaster } from "@/components/ui/toast"
import type { ToastVariant } from "@/components/ui/toast"

describe("Toast component", () => {
  const baseProps = { id: "t1", title: "Hello" }

  it("renders title", () => {
    render(<Toast {...baseProps} />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(<Toast {...baseProps} description="More detail" />)
    expect(screen.getByText("More detail")).toBeInTheDocument()
  })

  it("does not render description when absent", () => {
    render(<Toast {...baseProps} />)
    // No second paragraph
    expect(screen.getAllByRole("alert")).toHaveLength(1)
  })

  it.each([
    ["success" as ToastVariant],
    ["error" as ToastVariant],
    ["warning" as ToastVariant],
    ["info" as ToastVariant],
  ])("renders variant %s with correct data-variant attribute", (variant) => {
    render(<Toast {...baseProps} variant={variant} />)
    expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", variant)
  })

  it("defaults to info variant", () => {
    render(<Toast {...baseProps} />)
    expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", "info")
  })

  it("renders dismiss button when onDismiss provided", () => {
    const onDismiss = jest.fn()
    render(<Toast {...baseProps} onDismiss={onDismiss} />)
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument()
  })

  it("does not render dismiss button when onDismiss absent", () => {
    render(<Toast {...baseProps} />)
    expect(screen.queryByRole("button", { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it("calls onDismiss with toast id when dismiss button clicked", () => {
    const onDismiss = jest.fn()
    render(<Toast {...baseProps} id="xyz" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledWith("xyz")
  })

  it("has role=alert for screen readers", () => {
    render(<Toast {...baseProps} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})

// ─── Toaster tests ────────────────────────────────────────────────────────────

describe("Toaster", () => {
  it("renders region with aria-label", () => {
    render(<Toaster toasts={[]} onDismiss={jest.fn()} />)
    expect(screen.getByRole("region", { name: /notifications/i })).toBeInTheDocument()
  })

  it("renders no toasts when list is empty", () => {
    render(<Toaster toasts={[]} onDismiss={jest.fn()} />)
    expect(screen.queryByTestId("toast")).not.toBeInTheDocument()
  })

  it("renders multiple toasts", () => {
    const toasts = [
      { id: "1", title: "First" },
      { id: "2", title: "Second" },
    ]
    render(<Toaster toasts={toasts} onDismiss={jest.fn()} />)
    expect(screen.getAllByTestId("toast")).toHaveLength(2)
  })

  it("passes onDismiss to each toast", () => {
    const onDismiss = jest.fn()
    const toasts = [{ id: "a", title: "One" }]
    render(<Toaster toasts={toasts} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledWith("a")
  })
})

// ─── ToastProvider + useToast tests ──────────────────────────────────────────

import { ToastProvider, useToast } from "@/lib/hooks/use-toast"

function TestConsumer({
  action,
  onRender,
}: {
  action?: (ctx: ReturnType<typeof useToast>) => void
  onRender?: (ctx: ReturnType<typeof useToast>) => void
}) {
  const ctx = useToast()
  onRender?.(ctx)
  return (
    <div>
      <button onClick={() => action?.(ctx)}>trigger</button>
      <span data-testid="count">{ctx.toasts.length}</span>
    </div>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe("ToastProvider + useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it("returns no-op context when used outside provider", () => {
    // Graceful degradation: should not throw, just returns empty/no-op state
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).not.toThrow()
    expect(screen.getByTestId("count")).toHaveTextContent("0")
    spy.mockRestore()
  })

  it("starts with empty toast list", () => {
    render(<TestConsumer />, { wrapper: Wrapper })
    expect(screen.getByTestId("count")).toHaveTextContent("0")
  })

  it("toast() adds a toast", () => {
    render(
      <TestConsumer
        action={(ctx) => ctx.toast({ title: "Hi", variant: "info" })}
      />,
      { wrapper: Wrapper }
    )
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByTestId("count")).toHaveTextContent("1")
  })

  it("success() adds success toast", async () => {
    render(<TestConsumer action={(ctx) => ctx.success("Done")} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", "success")
    )
  })

  it("error() adds error toast", async () => {
    render(<TestConsumer action={(ctx) => ctx.error("Oops")} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", "error")
    )
  })

  it("warning() adds warning toast", async () => {
    render(<TestConsumer action={(ctx) => ctx.warning("Watch out")} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", "warning")
    )
  })

  it("info() adds info toast", async () => {
    render(<TestConsumer action={(ctx) => ctx.info("FYI")} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(screen.getByTestId("toast")).toHaveAttribute("data-variant", "info")
    )
  })

  it("dismiss() removes a toast", async () => {
    let toastId = ""
    render(
      <TestConsumer
        action={(ctx) => {
          toastId = ctx.toast({ title: "Remove me", duration: 0 })
          ctx.dismiss(toastId)
        }}
      />,
      { wrapper: Wrapper }
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"))
  })

  it("toast auto-dismisses after duration", async () => {
    render(
      <TestConsumer
        action={(ctx) => ctx.toast({ title: "Temp", duration: 1000 })}
      />,
      { wrapper: Wrapper }
    )
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByTestId("count")).toHaveTextContent("1")
    act(() => { jest.advanceTimersByTime(1001) })
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"))
  })

  it("toast with duration=0 does not auto-dismiss", () => {
    render(
      <TestConsumer
        action={(ctx) => ctx.toast({ title: "Persistent", duration: 0 })}
      />,
      { wrapper: Wrapper }
    )
    fireEvent.click(screen.getByRole("button"))
    act(() => { jest.advanceTimersByTime(60000) })
    expect(screen.getByTestId("count")).toHaveTextContent("1")
  })

  it("multiple toasts accumulate", () => {
    render(
      <TestConsumer
        action={(ctx) => {
          ctx.toast({ title: "A", duration: 0 })
          ctx.toast({ title: "B", duration: 0 })
          ctx.toast({ title: "C", duration: 0 })
        }}
      />,
      { wrapper: Wrapper }
    )
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByTestId("count")).toHaveTextContent("3")
  })

  it("renders Toaster container inside provider", () => {
    render(<TestConsumer />, { wrapper: Wrapper })
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
  })
})

// ─── ErrorBoundary tests ──────────────────────────────────────────────────────

import { ErrorBoundary, DefaultErrorFallback, withErrorBoundary } from "@/components/ui/error-boundary"

function BrokenComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error("Test crash")
  return <div>All good</div>
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress React's console.error for thrown errors in tests
    jest.spyOn(console, "error").mockImplementation(() => {})
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText("Safe content")).toBeInTheDocument()
  })

  it("renders default fallback on error", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId("error-fallback")).toBeInTheDocument()
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("shows error message in default fallback", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByTestId("error-message")).toHaveTextContent("Test crash")
  })

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Custom error UI")).toBeInTheDocument()
    expect(screen.queryByTestId("error-fallback")).not.toBeInTheDocument()
  })

  it("calls onError when error occurs", () => {
    const onError = jest.fn()
    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it("resets after Try again button click", () => {
    // Use a controllable crash flag
    let shouldThrow = true
    function Unstable() {
      if (shouldThrow) throw new Error("Unstable crash")
      return <div>Recovered</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Unstable />
      </ErrorBoundary>
    )
    expect(screen.getByTestId("error-fallback")).toBeInTheDocument()

    // Stop throwing, then reset the boundary
    shouldThrow = false
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    rerender(
      <ErrorBoundary>
        <Unstable />
      </ErrorBoundary>
    )
    expect(screen.getByText("Recovered")).toBeInTheDocument()
  })
})

describe("DefaultErrorFallback", () => {
  it("renders heading and reset button", () => {
    const onReset = jest.fn()
    render(<DefaultErrorFallback error={null} onReset={onReset} />)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  it("shows error message when present", () => {
    const error = new Error("Boom")
    render(<DefaultErrorFallback error={error} onReset={jest.fn()} />)
    expect(screen.getByTestId("error-message")).toHaveTextContent("Boom")
  })

  it("hides error message element when error is null", () => {
    render(<DefaultErrorFallback error={null} onReset={jest.fn()} />)
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument()
  })

  it("calls onReset when button clicked", () => {
    const onReset = jest.fn()
    render(<DefaultErrorFallback error={null} onReset={onReset} />)
    fireEvent.click(screen.getByRole("button"))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})

describe("withErrorBoundary HOC", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {})
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  function SafeComponent() {
    return <div>Safe</div>
  }

  it("renders wrapped component when no error", () => {
    const Wrapped = withErrorBoundary(SafeComponent)
    render(<Wrapped />)
    expect(screen.getByText("Safe")).toBeInTheDocument()
  })

  it("renders default error fallback on crash", () => {
    const Wrapped = withErrorBoundary(BrokenComponent)
    render(<Wrapped />)
    expect(screen.getByTestId("error-fallback")).toBeInTheDocument()
  })

  it("renders custom fallback when provided", () => {
    const Wrapped = withErrorBoundary(BrokenComponent, <div>Custom</div>)
    render(<Wrapped />)
    expect(screen.getByText("Custom")).toBeInTheDocument()
  })

  it("sets displayName on wrapped component", () => {
    const Wrapped = withErrorBoundary(SafeComponent)
    expect(Wrapped.displayName).toBe("withErrorBoundary(SafeComponent)")
  })
})
