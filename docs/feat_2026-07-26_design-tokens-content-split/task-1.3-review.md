42d06cd Step 1.3: index.css → CSS variables; PART_WIDTH_LIMITS → tokens.layout
---
 desktop/renderer/src/index.css                     | 45 ++++++++++--------
 desktop/renderer/src/workbench/WorkbenchLayout.tsx | 19 +++-----
 .../task-1.3-brief.md                              | 54 ++++++++++++++++++++++
 3 files changed, 86 insertions(+), 32 deletions(-)
---
diff --git a/desktop/renderer/src/index.css b/desktop/renderer/src/index.css
index 192a441..5f7295a 100644
--- a/desktop/renderer/src/index.css
+++ b/desktop/renderer/src/index.css
@@ -7,61 +7,66 @@ body,
 }
 
 body {
   -webkit-font-smoothing: antialiased;
   user-select: none;
 }
 
 /* 参考 HiAgents：淡紫灰渐变底 + 悬浮白色圆角面板，栏间留缝、无硬边框 */
 .app-shell {
   display: flex;
-  gap: 12px;
+  gap: var(--ga-spacing-shell-gap);
   height: 100vh;
-  padding: 12px;
+  padding: var(--ga-spacing-shell-padding);
   box-sizing: border-box;
-  background: linear-gradient(135deg, #e9ecf6 0%, #f4f5fa 60%, #eef7f4 100%);
+  background: linear-gradient(
+    135deg,
+    var(--ga-color-shell-gradient-from) 0%,
+    var(--ga-color-shell-gradient-via) 60%,
+    var(--ga-color-shell-gradient-to) 100%
+  );
 }
 
 .panel {
-  background: #ffffff;
-  border-radius: 16px;
-  box-shadow: 0 4px 24px rgba(30, 40, 80, 0.06);
+  background: var(--ga-color-bg-panel);
+  border-radius: var(--ga-radius-panel);
+  box-shadow: 0 4px 24px var(--ga-color-shadow-panel);
   overflow: hidden;
   display: flex;
   flex-direction: column;
 }
 
 .panel-sidebar {
-  width: 232px;
+  width: var(--ga-layout-sidebar-default);
   flex: none;
   /* 融入背景：无白底、无投影 */
   background: transparent;
   box-shadow: none;
 }
 
 /* 参考 HiAgents：选中项为白色胶囊 + 轻投影 + 薄荷绿图标 */
 .panel-sidebar .ant-menu {
   background: transparent;
 }
 
 .panel-sidebar .ant-menu-item-selected {
-  box-shadow: 0 2px 10px rgba(30, 40, 80, 0.08);
+  box-shadow: 0 2px 10px var(--ga-color-shadow-menu-item);
 }
 
 .panel-sidebar .ant-menu-item-selected .anticon {
-  color: #2ed3b0;
+  color: var(--ga-color-primary);
 }
 
 /* 参考 HiAgents：顶部导航条融入背景，兼作窗口拖拽区（无边框窗口） */
 .topbar {
   flex: none;
-  height: 56px;
+  height: var(--ga-layout-topbar-height);
   display: flex;
   align-items: center;
   padding: 8px 12px 0;
   -webkit-app-region: drag;
 }
 
 .topbar button,
 .topbar a {
   -webkit-app-region: no-drag;
 }
@@ -85,59 +90,59 @@ body {
   align-items: center;
   gap: 8px;
 }
 
 .topbar .step {
   display: inline-flex;
   align-items: center;
   gap: 6px;
   padding: 4px 14px;
   border-radius: 999px;
-  font-size: 13px;
-  color: #8a8f9c;
+  font-size: var(--ga-font-size-small);
+  color: var(--ga-color-text-secondary);
 }
 
 .topbar .step-active {
-  background: #e4f7f1;
-  color: #12a98c;
+  background: var(--ga-color-bg-active);
+  color: var(--ga-color-link);
   font-weight: 600;
 }
 
 .main-column {
   flex: 1;
   min-width: 0;
   display: flex;
   flex-direction: column;
-  gap: 12px;
+  gap: var(--ga-spacing-shell-gap);
 }
 
 .main-row {
   flex: 1;
   min-height: 0;
   display: flex;
-  gap: 12px;
+  gap: var(--ga-spacing-shell-gap);
 }
 
 .panel-content {
   flex: 1;
   min-width: 0;
   overflow: auto;
 }
 
 .panel-chat {
-  width: 400px;
+  width: var(--ga-layout-auxiliary-default);
   flex: none;
 }
 
 /* Part 拖拽调宽手柄：10px 透明热区，负 margin 抵消两侧 12px flex gap（12+10-22+12=12），视觉间距不变 */
 .part-resize-handle {
   flex: none;
-  width: 10px;
+  width: var(--ga-layout-resize-handle-size);
   margin: 0 -11px;
   cursor: col-resize;
   z-index: 10;
-  border-radius: 5px;
+  border-radius: var(--ga-radius-handle);
 }
 
 .part-resize-handle:hover {
-  background: rgba(46, 211, 176, 0.25);
+  background: var(--ga-color-handle-hover);
 }
diff --git a/desktop/renderer/src/workbench/WorkbenchLayout.tsx b/desktop/renderer/src/workbench/WorkbenchLayout.tsx
index 81ca77c..2b4d0f0 100644
--- a/desktop/renderer/src/workbench/WorkbenchLayout.tsx
+++ b/desktop/renderer/src/workbench/WorkbenchLayout.tsx
@@ -1,21 +1,16 @@
 import { useMemo, useState, useSyncExternalStore } from 'react'
 import { Registry } from './registry'
 import { ResizeHandle } from './ResizeHandle'
 import type { PageManager } from './pageManager'
 import type { PageResolution } from './registry'
-
-/** sidebar / auxiliary 的默认宽度与拖拽范围（px）。content 为 flex:1 随动，无需配置 */
-export const PART_WIDTH_LIMITS = {
-  sidebar: { default: 232, min: 180, max: 480 },
-  auxiliary: { default: 400, min: 280, max: 640 }
-} as const
+import { tokens } from '../theme/tokens'
 
 interface WorkbenchLayoutProps {
   pageManager: PageManager
 }
 
 /**
  * Subscribe to both pageManager and registry changes.
  * Snapshot is a lightweight comparable value (pageId + registryVersion);
  * the expensive resolvePage() is only called via useMemo when snapshot changes.
  */
@@ -40,42 +35,42 @@ function usePageResolution(pageManager: PageManager): PageResolution | undefined
   return useMemo(() => {
     if (snapshot === null) return undefined
     const pageId = snapshot.split('@')[0]
     return Registry.instance.resolvePage(pageId)
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [snapshot])
 }
 
 export function WorkbenchLayout({ pageManager }: WorkbenchLayoutProps): JSX.Element {
   const resolution = usePageResolution(pageManager)
-  const [sidebarWidth, setSidebarWidth] = useState<number>(PART_WIDTH_LIMITS.sidebar.default)
-  const [auxiliaryWidth, setAuxiliaryWidth] = useState<number>(PART_WIDTH_LIMITS.auxiliary.default)
+  const [sidebarWidth, setSidebarWidth] = useState<number>(tokens.layout.sidebarDefault)
+  const [auxiliaryWidth, setAuxiliaryWidth] = useState<number>(tokens.layout.auxiliaryDefault)
 
   return (
     <div className="app-shell">
       {/* Sidebar */}
       <aside className="panel panel-sidebar" style={{ width: sidebarWidth }}>
         {resolution?.sidebar && (
           <>
             <div>{resolution.sidebar.container.title}</div>
             {resolution.sidebar.views.map((v) => (
               <v.component key={v.id} />
             ))}
           </>
         )}
       </aside>
       <ResizeHandle
         getWidth={() => sidebarWidth}
         setWidth={setSidebarWidth}
         direction={1}
-        min={PART_WIDTH_LIMITS.sidebar.min}
-        max={PART_WIDTH_LIMITS.sidebar.max}
+        min={tokens.layout.sidebarMin}
+        max={tokens.layout.sidebarMax}
       />
 
       <div className="main-column">
         {/* Topbar */}
         <header className="topbar">
           <div className="topbar-left">
             {resolution?.topbar.left.map((item, i) => (
               <item.component key={`left-${i}`} />
             ))}
           </div>
@@ -97,22 +92,22 @@ export function WorkbenchLayout({ pageManager }: WorkbenchLayoutProps): JSX.Elem
             {resolution?.content && <resolution.content.view.component />}
           </main>
 
           {/* Auxiliary */}
           {resolution?.auxiliary && (
             <>
               <ResizeHandle
                 getWidth={() => auxiliaryWidth}
                 setWidth={setAuxiliaryWidth}
                 direction={-1}
-                min={PART_WIDTH_LIMITS.auxiliary.min}
-                max={PART_WIDTH_LIMITS.auxiliary.max}
+                min={tokens.layout.auxiliaryMin}
+                max={tokens.layout.auxiliaryMax}
               />
               <aside className="panel panel-chat" style={{ width: auxiliaryWidth }}>
                 <resolution.auxiliary.view.component />
               </aside>
             </>
           )}
         </div>
       </div>
     </div>
   )
