import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { AppLanguage } from "@/types/i18n";

export const LANGUAGE_STORAGE_KEY = "language-preference";
export const DEFAULT_LANGUAGE: AppLanguage = "en-US";

export const APP_TITLES: Record<AppLanguage, string> = {
  "en-US": "Tyche | Trading Journal",
  "zh-CN": "Tyche | 交易日志",
};

const resources = {
  "en-US": {
    translation: {
      common: {
        brand: "Tyche",
        loading: "Loading...",
        cancel: "Cancel",
        confirm: "Confirm",
        now: "Now",
        understood: "Got it",
        themeToggle: {
          ariaLabel: "Theme switcher",
          light: "Light",
          dark: "Dark",
          system: "System",
          shortLight: "L",
          shortDark: "D",
          shortSystem: "S",
          switchToLight: "Switch to light mode",
          switchToDark: "Switch to dark mode",
        },
        languageToggle: {
          ariaLabel: "Language switcher",
          english: "English",
          chinese: "Chinese",
          shortEnglish: "EN",
          shortChinese: "中",
          switchToEnglish: "Switch to English",
          switchToChinese: "Switch to Simplified Chinese",
        },
        account: {
          ariaLabel: "Open account menu",
          title: "Account",
          fallbackName: "Account",
          signedIn: "Signed in",
          openMenu: "Open account menu",
          signedInUser: "Signed in user",
          logOut: "Log out",
          loggingOut: "Logging out...",
        },
        errorBoundary: {
          title: "Something went wrong",
          description:
            "Refresh the page and try again. If the issue persists, review your environment variables or recent changes.",
        },
      },
      auth: {
        authExpired:
          "This registration link has expired. Please sign up again and verify your email from the new message.",
        callbackLoading: "Signing you in...",
        dialog: {
          loginTitle: "Sign in",
          loginDescription: "Sign in to continue",
          registerTitle: "Create account",
          registerDescription: "Create a new account",
          registeredTitle: "Notice",
          registeredDescription: "This email is already registered",
          verifyEmailTitle: "Check your email",
          verifyEmailDescription:
            "Registration succeeded. Please verify your email first",
          missingSupabaseConfig:
            "The current app is missing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, so auth actions stay disabled.",
          googleLogin: "Continue with Google",
          googleFirstUse:
            "Your first Google sign-in will automatically create an account",
          divider: "Or",
          registeredAutoLogin:
            "This email is already registered. We will log you in and redirect automatically...",
          redirectCountdown: "Redirecting in {{count}}s",
          verificationSentPrefix: "Verification email sent to",
          verificationAction:
            "Open your inbox and click the verification link.",
          verificationHint:
            "If it does not arrive within a few minutes, check spam or promotions.",
          backToLogin: "Back to sign in",
          emailLabel: "Email",
          passwordLabel: "Password",
          confirmPasswordLabel: "Confirm password",
          emailPlaceholder: "you@example.com",
          passwordPlaceholder: "At least 6 characters",
          confirmPasswordPlaceholder: "Enter your password again",
          processing: "Processing...",
          signInAction: "Sign in",
          registerAction: "Sign up",
          noAccountPrefix: "No account?",
          noAccountAction: "Create one",
          hasAccountPrefix: "Already have an account?",
          hasAccountAction: "Sign in",
        },
        errors: {
          emailNotConfirmed:
            "This email has not been verified yet. Please sign up again and verify it from your inbox before signing in.",
          invalidCredentials:
            "The email or password is incorrect. Please try again.",
          userAlreadyRegistered:
            "This email is already registered. Please sign in instead.",
          unavailable:
            "Supabase is not configured yet, so authentication is unavailable.",
          generic: "Authentication failed. Please try again later.",
        },
        validation: {
          invalidEmail: "Please enter a valid email address",
          passwordMin: "Password must be at least 6 characters",
          confirmPasswordRequired: "Please confirm your password",
          passwordsMismatch: "The two passwords do not match",
        },
      },
      landing: {
        hero: {
          loginAria: "Open sign-in dialog",
          getStarted: "Get Started",
          startJournal: "Start Trading Journal",
          titleLine1: "Plan your trade",
          titleLine2: "Trade your plan",
        },
        ticker: {
          ariaLabel: "Market ticker",
        },
        marketTypes: {
          equities: "Equities",
          futures: "Futures",
        },
        countries: {
          US: "United States",
          JP: "Japan",
          HK: "Hong Kong SAR",
          CN: "China",
          GB: "United Kingdom",
        },
        markets: {
          newYork: {
            name: "New York Stock Exchange",
          },
          chicago: {
            name: "Chicago Mercantile Exchange",
          },
          tokyo: {
            name: "Tokyo Stock Exchange",
          },
          hongKong: {
            name: "Hong Kong Exchanges",
          },
          shanghai: {
            name: "Shanghai Stock Exchange",
          },
          london: {
            name: "London Stock Exchange",
          },
        },
        globe: {
          markerAria: "{{name}} market",
        },
      },
      dashboard: {
        overviewTitle: "Dashboard Overview",
        filters: {
          all: "All Time",
          last7Days: "Last 7 Days",
          last30Days: "Last 30 Days",
          thisMonth: "This Month",
          thisYear: "This Year",
          custom: "Custom Range",
        },
        actions: {
          importData: "Import Data",
          logTrade: "Log Trade",
          confirmDeleteTrade: "Are you sure you want to delete this trade?",
          deleteTrade: "Delete",
        },
        stats: {
          netPnl: "Net P&L",
          allTime: "All time",
          winRate: "Win Rate",
          profitFactor: "Profit Factor",
          grossProfitOverGrossLoss: "Gross Profit / Gross Loss",
          totalTrades: "Total Trades",
          averageWin: "Average Win",
          averageLoss: "Average Loss",
          largestWin: "Largest Win",
          largestLoss: "Largest Loss",
        },
        filterPills: {
          all: "All",
          last7Days: "7D",
          last30Days: "30D",
          thisMonth: "Month",
          thisYear: "Year",
          custom: "Custom",
        },
        calendar: {
          thisMonth: "This month",
          monthlyStats: "Monthly stats",
          week: "Week {{number}}",
          trade: "{{count}} trade",
          trades: "{{count}} trades",
          day: "{{count}} day",
          days: "{{count}} days",
          tradeAnalysis: "Trade Analysis",
        },
        charts: {
          cumulativePnl: "Cumulative P&L",
          cumulativePnlSeries: "Cumulative P&L",
          winLossRatio: "Win / Loss Ratio",
          wins: "Wins",
          losses: "Losses",
          dailyPnl: "Daily P&L",
          dailyPnlSeries: "Daily P&L",
        },
        table: {
          recentTrades: "Recent Trades",
          date: "Date",
          product: "Product",
          type: "Type",
          entry: "Entry",
          exit: "Exit",
          lot: "Lot",
          pnl: "P&L",
          notes: "Notes",
          actions: "Actions",
          empty: "No trades recorded yet. Add your first trade to see it here.",
          deleteTradeAria: "Delete trade",
        },
        tradeTypes: {
          LONG: "Long",
          SHORT: "Short",
        },
        form: {
          title: "Log New Trade",
          date: "Date",
          product: "Product",
          type: "Type",
          entryPrice: "Entry Price",
          exitPrice: "Exit Price",
          lot: "Lot",
          notes: "Notes (Optional)",
          productPlaceholder: "e.g. BTC/USD",
          notesPlaceholder: "Why did you take this trade?",
          dateTimePlaceholder: "Pick date & time",
          hoursLabel: "Hours",
          minutesLabel: "Minutes",
          saveTrade: "Save Trade",
        },
      },
      routes: {
        analytics: "Analytics",
        tradeList: "Trades",
        tradeDetail: "Trade {{id}}",
        import: "Import MT5 Data",
      },
      importPage: {
        hero: {
          eyebrow: "Manual Import",
          title: "Upload your MT5 trade report",
          description:
            "Choose an MT5 XLSX history report and send it to the backend for parsing and storage. The import keeps your authenticated session, creates or reuses the trading account automatically, and skips duplicate trades safely.",
          badges: {
            authRequired: "Authenticated upload",
            xlsxOnly: "XLSX only",
            duplicateSafe: "Duplicate-safe import",
          },
        },
        form: {
          title: "Import trade history",
          description:
            "The backend will parse the report and return an import summary after the upload finishes.",
          fileLabel: "Trade report file",
          fileHint:
            "Supported format: MT5 Chinese XLSX report. The backend currently accepts `.xlsx` files only.",
          emptySelection: "Select an `.xlsx` trade report to begin the import.",
          selectedMeta: "Selected file size: {{size}}",
          submit: "Start import",
          submitting: "Importing...",
          reset: "Clear selection",
        },
        info: {
          title: "What happens during import",
          description:
            "This page only handles secure upload. Parsing and persistence happen on the backend.",
          steps: {
            uploadTitle: "1. Upload the source file",
            uploadDescription:
              "Your browser sends the XLSX report as multipart form data with the current auth token.",
            parseTitle: "2. Backend parses and stores trades",
            parseDescription:
              "The server extracts account metadata, imports new trades, and skips duplicate tickets for the same account.",
            resultTitle: "3. Review the import summary",
            resultDescription:
              "After completion, you will see how many rows were imported or skipped and which trading account was matched.",
          },
        },
        result: {
          title: "Import completed",
          description:
            "The backend accepted the file and returned the latest import summary.",
          imported: "Imported",
          skipped: "Skipped",
          accountTitle: "Matched trading account",
          accountName: "Account name",
          accountNumber: "Account number",
          platform: "Platform",
          company: "Company",
          companyEmpty: "Not provided",
        },
        validation: {
          required: "Please choose an XLSX file before submitting.",
          fileType: "Only `.xlsx` files are supported for now.",
          emptyFile: "The selected file is empty. Please choose another file.",
        },
      },
    },
  },
  "zh-CN": {
    translation: {
      common: {
        brand: "Tyche",
        loading: "加载中...",
        cancel: "取消",
        confirm: "确定",
        now: "现在",
        understood: "我知道了",
        themeToggle: {
          ariaLabel: "主题切换",
          light: "浅色",
          dark: "深色",
          system: "跟随系统",
          shortLight: "浅",
          shortDark: "深",
          shortSystem: "跟",
          switchToLight: "切换到浅色主题",
          switchToDark: "切换到深色主题",
        },
        languageToggle: {
          ariaLabel: "语言切换",
          english: "English",
          chinese: "简体中文",
          shortEnglish: "EN",
          shortChinese: "中",
          switchToEnglish: "切换到 English",
          switchToChinese: "切换到简体中文",
        },
        account: {
          ariaLabel: "打开账户菜单",
          title: "账户",
          fallbackName: "账户",
          signedIn: "已登录",
          openMenu: "打开账户菜单",
          signedInUser: "已登录用户",
          logOut: "退出登录",
          loggingOut: "正在退出...",
        },
        errorBoundary: {
          title: "页面出现错误",
          description:
            "请刷新页面后重试。如果问题持续存在，再检查环境变量或最近的改动。",
        },
      },
      auth: {
        authExpired: "注册链接已过期，请重新注册后再前往邮箱完成验证。",
        callbackLoading: "正在登录...",
        dialog: {
          loginTitle: "登录",
          loginDescription: "登录你的账号以继续",
          registerTitle: "注册",
          registerDescription: "创建一个新账号",
          registeredTitle: "提示",
          registeredDescription: "该邮箱已注册",
          verifyEmailTitle: "查收验证邮件",
          verifyEmailDescription: "注册成功，请先完成邮箱验证",
          missingSupabaseConfig:
            "当前还没配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，认证按钮会保持不可用。",
          googleLogin: "使用 Google 登录",
          googleFirstUse: "首次使用 Google 登录将自动创建账号",
          divider: "或",
          registeredAutoLogin: "该邮箱已注册，将自动为您登录并跳转...",
          redirectCountdown: "{{count}} 秒后自动跳转",
          verificationSentPrefix: "验证邮件已发送至",
          verificationAction: "请前往邮箱点击验证链接",
          verificationHint:
            "如果几分钟内没有收到邮件，请检查垃圾箱或广告邮件分类。",
          backToLogin: "返回登录",
          emailLabel: "邮箱",
          passwordLabel: "密码",
          confirmPasswordLabel: "确认密码",
          emailPlaceholder: "you@example.com",
          passwordPlaceholder: "至少 6 个字符",
          confirmPasswordPlaceholder: "再次输入密码",
          processing: "处理中...",
          signInAction: "登录",
          registerAction: "注册",
          noAccountPrefix: "没有账号？",
          noAccountAction: "注册",
          hasAccountPrefix: "已有账号？",
          hasAccountAction: "登录",
        },
        errors: {
          emailNotConfirmed:
            "该邮箱尚未完成验证，当前无法登录。请重新注册并前往邮箱完成验证。",
          invalidCredentials: "邮箱或密码错误，请重新尝试。",
          userAlreadyRegistered: "该邮箱已注册，请直接登录。",
          unavailable: "尚未配置 Supabase，当前登录功能不可用。",
          generic: "认证失败，请稍后重试。",
        },
        validation: {
          invalidEmail: "请输入有效的邮箱地址",
          passwordMin: "密码至少需要 6 个字符",
          confirmPasswordRequired: "请确认密码",
          passwordsMismatch: "两次输入的密码不一致",
        },
      },
      landing: {
        hero: {
          loginAria: "打开登录面板",
          getStarted: "开始使用",
          startJournal: "开始记录交易",
          titleLine1: "规划你的交易",
          titleLine2: "执行你的计划",
        },
        ticker: {
          ariaLabel: "市场行情滚动预留栏",
        },
        marketTypes: {
          equities: "股票",
          futures: "期货",
        },
        countries: {
          US: "美国",
          JP: "日本",
          HK: "中国香港",
          CN: "中国",
          GB: "英国",
        },
        markets: {
          newYork: {
            name: "纽约证券交易所",
          },
          chicago: {
            name: "芝加哥商品交易所",
          },
          tokyo: {
            name: "东京证券交易所",
          },
          hongKong: {
            name: "香港交易所",
          },
          shanghai: {
            name: "上海证券交易所",
          },
          london: {
            name: "伦敦证券交易所",
          },
        },
        globe: {
          markerAria: "{{name}} 市场",
        },
      },
      dashboard: {
        overviewTitle: "仪表盘概览",
        filters: {
          all: "全部时间",
          last7Days: "最近 7 天",
          last30Days: "最近 30 天",
          thisMonth: "本月",
          thisYear: "今年",
          custom: "自定义区间",
        },
        actions: {
          importData: "导入数据",
          logTrade: "记录交易",
          confirmDeleteTrade: "确定要删除这笔交易吗？",
          deleteTrade: "删除",
        },
        stats: {
          netPnl: "净盈亏",
          allTime: "累计",
          winRate: "胜率",
          profitFactor: "盈亏比",
          grossProfitOverGrossLoss: "总盈利 / 总亏损",
          totalTrades: "交易总数",
          averageWin: "平均盈利",
          averageLoss: "平均亏损",
          largestWin: "最大盈利",
          largestLoss: "最大亏损",
        },
        filterPills: {
          all: "全部",
          last7Days: "7天",
          last30Days: "30天",
          thisMonth: "本月",
          thisYear: "今年",
          custom: "自定义",
        },
        calendar: {
          thisMonth: "本月",
          monthlyStats: "月度统计",
          week: "第{{number}}周",
          trade: "{{count}} 笔交易",
          trades: "{{count}} 笔交易",
          day: "{{count}} 天",
          days: "{{count}} 天",
          tradeAnalysis: "交易分析",
        },
        charts: {
          cumulativePnl: "累计盈亏",
          cumulativePnlSeries: "累计盈亏",
          winLossRatio: "盈亏分布",
          wins: "盈利",
          losses: "亏损",
          dailyPnl: "每日盈亏",
          dailyPnlSeries: "每日盈亏",
        },
        table: {
          recentTrades: "最近交易",
          date: "日期",
          product: "产品",
          type: "方向",
          entry: "开仓价",
          exit: "平仓价",
          lot: "手数",
          pnl: "盈亏",
          notes: "备注",
          actions: "操作",
          empty: "还没有交易记录，添加第一笔交易后会显示在这里。",
          deleteTradeAria: "删除交易",
        },
        tradeTypes: {
          LONG: "做多",
          SHORT: "做空",
        },
        form: {
          title: "记录新交易",
          date: "日期",
          product: "产品",
          type: "方向",
          entryPrice: "开仓价",
          exitPrice: "平仓价",
          lot: "手数",
          notes: "备注（可选）",
          productPlaceholder: "例如 BTC/USD",
          notesPlaceholder: "你为什么做这笔交易？",
          dateTimePlaceholder: "选择日期和时间",
          hoursLabel: "小时",
          minutesLabel: "分钟",
          saveTrade: "保存交易",
        },
      },
      routes: {
        analytics: "分析",
        tradeList: "交易列表",
        tradeDetail: "交易 {{id}}",
        import: "导入 MT5 数据",
      },
      importPage: {
        hero: {
          eyebrow: "手动导入",
          title: "上传你的 MT5 交易报表",
          description:
            "选择一份 MT5 XLSX 历史报表后，前端会把文件发送给后端进行解析和入库。整个流程会复用当前登录态，自动创建或复用交易账户，并安全跳过重复交易。",
          badges: {
            authRequired: "需要登录后上传",
            xlsxOnly: "仅支持 XLSX",
            duplicateSafe: "重复交易自动跳过",
          },
        },
        form: {
          title: "导入交易历史",
          description: "上传完成后，后端会负责解析报表并返回本次导入结果摘要。",
          fileLabel: "交易报表文件",
          fileHint:
            "支持格式：MT5 中文 XLSX 报表。当前后端只接受 `.xlsx` 文件。",
          emptySelection: "请选择一份 `.xlsx` 交易报表后开始导入。",
          selectedMeta: "已选文件大小：{{size}}",
          submit: "开始导入",
          submitting: "正在导入...",
          reset: "清空选择",
        },
        info: {
          title: "导入过程中会发生什么",
          description: "这个页面只负责安全上传，真正的解析和入库仍由后端完成。",
          steps: {
            uploadTitle: "1. 上传源文件",
            uploadDescription:
              "浏览器会携带当前登录态，把 XLSX 报表按 multipart form data 发送给后端。",
            parseTitle: "2. 后端解析并写入交易数据",
            parseDescription:
              "服务端会提取账户信息、导入新增交易，并对同一账户下的重复 ticket 自动跳过。",
            resultTitle: "3. 查看导入摘要",
            resultDescription:
              "导入完成后，页面会显示导入/跳过数量，以及本次匹配到的交易账户信息。",
          },
        },
        result: {
          title: "导入完成",
          description: "后端已接收文件，并返回了最新的导入结果摘要。",
          imported: "成功导入",
          skipped: "跳过重复",
          accountTitle: "匹配到的交易账户",
          accountName: "账户名称",
          accountNumber: "账户编号",
          platform: "平台信息",
          company: "公司",
          companyEmpty: "未提供",
        },
        validation: {
          required: "请先选择一个 XLSX 文件再提交。",
          fileType: "当前仅支持上传 `.xlsx` 文件。",
          emptyFile: "所选文件为空，请重新选择。",
        },
      },
    },
  },
} as const;

export function isSupportedLanguage(
  value: string | null | undefined,
): value is AppLanguage {
  return value === "en-US" || value === "zh-CN";
}

export function resolveLanguage(value: string | null | undefined): AppLanguage {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue.startsWith("zh")) {
    return "zh-CN";
  }

  return "en-US";
}

export function readStoredLanguage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
}

export function detectBrowserLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return resolveLanguage(window.navigator.language);
}

export function getInitialLanguage() {
  const storedLanguage = readStoredLanguage();

  if (isSupportedLanguage(storedLanguage)) {
    return storedLanguage;
  }

  return detectBrowserLanguage();
}

export function applyLanguageMetadata(language: AppLanguage) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
  document.title = APP_TITLES[language];
}

const initialLanguage = getInitialLanguage();

applyLanguageMetadata(initialLanguage);

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ["en-US", "zh-CN"],
    load: "currentOnly",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

i18n.on("languageChanged", (nextLanguage) => {
  const resolvedLanguage = resolveLanguage(nextLanguage);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
  }

  applyLanguageMetadata(resolvedLanguage);
});

export { i18n };
