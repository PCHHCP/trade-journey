import { Component, type ErrorInfo, type ReactNode } from "react";
import { withTranslation, type WithTranslation } from "react-i18next";

interface AppErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundaryBase extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void error;
    void errorInfo;
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;

      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("common.errorBoundary.title")}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("common.errorBoundary.description")}
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export const AppErrorBoundary = withTranslation()(AppErrorBoundaryBase);
