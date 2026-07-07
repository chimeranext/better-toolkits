# Ant Design Component Catalog (Vite + React / Vue)

Reference for gap analysis on Vite projects using Ant Design — a feature-rich enterprise-oriented design system. Primary target: React (`antd`); Vue variant (`ant-design-vue`) is structurally parallel with Vue-flavored APIs.

Use Context7 MCP for current docs:
```
resolve-library-id: "antd"
query-docs: "Ant Design components and token customization"
```

## Component Catalog — antd (React)

Categorized by Ant Design's own taxonomy for easier cross-reference.

### General

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Button | Atom | primary / default / dashed / text / link types |
| FloatButton | Atom | Floating action primitive |
| Icon | Atom | `@ant-design/icons` |
| Typography | Atom | Text / Title / Paragraph / Link |

### Layout

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Divider | Atom | |
| Flex | Atom | Layout primitive |
| Grid (Row / Col) | Atom | 24-column grid |
| Layout | Organism | Header / Sider / Content / Footer wrappers |
| Space | Atom | Spacing between children |
| Splitter | Organism | Resizable split panes (v5+) |

### Navigation

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Anchor | Organism | Page section navigation |
| Breadcrumb | Molecule | |
| Dropdown | Molecule | |
| Menu | Organism | Horizontal / vertical / inline modes |
| Pagination | Molecule | |
| Steps | Organism | |
| Tabs | Molecule | |

### Data Entry

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| AutoComplete | Molecule | |
| Cascader | Molecule | Multi-level select — distinctive to Ant |
| Checkbox | Atom | |
| ColorPicker | Molecule | |
| DatePicker | Molecule | RangePicker variant |
| Form | Organism | Form.Item for fields; built-in validation |
| Input | Atom | Variants: TextArea, Search, Password, OTP |
| InputNumber | Atom | |
| Mentions | Molecule | |
| Radio | Atom | Radio.Group + Radio.Button variants |
| Rate | Molecule | |
| Select | Atom | |
| Slider | Atom | |
| Switch | Atom | |
| TimePicker | Molecule | |
| Transfer | Organism | Dual-list for large multi-select — distinctive |
| TreeSelect | Molecule | |
| Upload | Organism | Drag / picture-card / list variants |

### Data Display

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Avatar | Atom | Avatar.Group molecule |
| Badge | Atom | Ribbon variant |
| Calendar | Organism | Month / year views |
| Card | Molecule | |
| Carousel | Organism | |
| Collapse | Molecule | Panels |
| Descriptions | Molecule | Key-value metadata display |
| Empty | Molecule | Empty-state primitive |
| Image | Atom | Preview + group variants |
| List | Molecule | |
| Popover | Molecule | |
| QRCode | Atom | |
| Segmented | Molecule | Toggle group |
| Statistic | Molecule | |
| Table | Organism | Sorters / filters / expandable / tree-data |
| Tabs | Molecule | See Navigation section |
| Tag | Atom | CheckableTag molecule |
| Timeline | Organism | |
| Tooltip | Atom | |
| Tour | Organism | Onboarding walkthrough |
| Tree | Organism | |

### Feedback

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Alert | Molecule | |
| Drawer | Organism | |
| Message | Organism | Imperative toast — use `message.success(...)` |
| Modal | Organism | Confirm / info / success / error imperative APIs |
| Notification | Organism | Imperative system notification |
| Popconfirm | Molecule | Inline confirm dialog |
| Progress | Atom | line / circle / dashboard variants |
| Result | Organism | Status pages (403 / 404 / 500) |
| Skeleton | Atom | Avatar / Button / Image / Input / Node subcomponents |
| Spin | Atom | Loading spinner |
| Watermark | Atom | Document watermark primitive |

### Other

| Component | Atomic Level | Notes |
|-----------|-------------|-------|
| Affix | Atom | Sticky positioning primitive |
| App | n/a | Context root for message / notification / modal APIs (v5+) |
| ConfigProvider | n/a | Locale / direction / theme root |
| Tour | Organism | See Data Display |

## Design Tokens (Ant Design v5+)

Ant Design v5 introduced a first-class design-token system. Tokens are typed and applied via `ConfigProvider` at runtime (no build-time compilation needed).

| Token Category | API | Example |
|---------------|-----|---------|
| Brand color | `token.colorPrimary` | `{ theme: { token: { colorPrimary: '#FF5733' } } }` |
| Neutral colors | `token.colorText`, `token.colorBgContainer` | |
| Font | `token.fontFamily`, `token.fontSize` | |
| Size / spacing | `token.padding`, `token.margin`, `token.borderRadius` | |
| Motion | `token.motionDurationFast`, `token.motionEaseInOut` | |
| Component-level overrides | `components.Button.primaryColor` | Targeted theme overrides |

Theme switching (light / dark / compact) uses presets:
```ts
import { ConfigProvider, theme } from 'antd';
<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
```

## Audit Hotspots Specific to Ant Design

- **antd v4 + v5 coexistence** — signal #3 of the bundle-health checklist. v5 dropped `less` in favor of CSS-in-JS (`@ant-design/cssinjs`). Half-migrated projects will carry both, which is a blocker.
- **`less` configuration leftover** — v4 required custom less loader config in the build tool; v5 does not. Check `vite.config.*` for now-unused less overrides.
- **Locale / direction providers missing** — multilingual apps need `ConfigProvider locale={...}`; RTL apps need `direction="rtl"`. Missing providers produce silently wrong dates and layouts.
- **Imperative APIs called outside `<App>`** — in v5, `message.*`, `notification.*`, and `Modal.confirm` must be invoked from within an `<App>` descendant (or you lose theme inheritance). Static versions (`message.useMessage()`) are the recommended fix.
- **Icon import anti-pattern** — `import { UserOutlined } from '@ant-design/icons'` is fine (tree-shaken). Avoid `import * as Icons from '@ant-design/icons'`, which blows up bundle size.
- **Heavy `<Table>` usage without virtualization** — Ant's `<Table>` is not virtualized by default. Tables over ~500 rows should switch to `@ant-design/react-slick` or a virtualization wrapper.

## Migration Hints

1. Install `antd@^5`, `@ant-design/icons`, optionally `@ant-design/cssinjs` for SSR.
2. Wrap the app root with `<ConfigProvider>` + `<App>`.
3. Centralize `theme.token` overrides in `src/theme/antd.ts`.
4. For v4 → v5 migrations: use `@ant-design/codemod-v5`; follow it with the official breaking-changes checklist (Message API, Form.Item `name` semantics, locale keys).
5. Prefer the hook-based APIs (`App.useApp()`, `Form.useForm()`, `message.useMessage()`) — they inherit theme and context; the static imports do not.
