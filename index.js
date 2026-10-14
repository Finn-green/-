import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "SillyTavern-Fullscreen";

// 默认设置对象
const defaultSettings = {
    fullscreen: false,
    bottomBarPosition: 0, 
    onlyHideTopBar: false
};

// 初始化与补全设置
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = {};
}
for (const [key, value] of Object.entries(defaultSettings)) {
    if (extension_settings[extensionName][key] === undefined) {
        extension_settings[extensionName][key] = value;
    }
}

const settings = extension_settings[extensionName];

// ================== CSS 样式 (内嵌于脚本中) ==================
const customCSS = `
/* ================== 插件面板基础样式 ================== */
.te-sub-options {
  margin: 5px 0 10px 10px;
  border-left: 1px solid var(--SmartThemeBodyColor);
  padding-left: 10px;
  display: none;
}
#te-settings-drawer #te_fs_options > div > label,
#te-settings-drawer #te_fs_options > label {
  margin: 0 !important;
  padding: 5px 0 5px 5px !important;
}
#te-settings-drawer > div.inline-drawer-content > label,
#te-settings-drawer > div.inline-drawer-content > div.flex-container.flexFlowColumn > label {
  align-items: center !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
.te-setting-title { padding-left: 10px; }

/* ================== 启用全屏模式的核心逻辑 ================== */
body.te-fullscreen {
  #form_sheld {
    margin: 0 auto !important;
    position: absolute !important;
    bottom: calc(var(--te-bottom-bar-pos, 0) * 1px) !important;
    left: 0 !important;
    transform: none !important;
    &:has(#send_textarea:focus, #send_textarea:not(:placeholder-shown)) {
      position: sticky !important;
      background-color: var(--SmartThemeChatTintColor);
    }
  }

  &:not(.waifuMode) #sheld {
    top: 0 !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
  }

  #chat {
    height: 100dvh !important;
    min-height: 100dvh !important;
    padding-top: calc(var(--topBarBlockSize) * 2) !important;
  }

  &:not(.te-only-hide-top-bar) {
    #send_form, #form_sheld {
      opacity: 0;
      transition: all 0.5s ease;
      &:focus-within,
      &:hover,
      &:has(#send_textarea:not(:placeholder-shown)) {
        opacity: 1;
      }
    }
  }

  #form_sheld:has(#dialogue_del_mes[style*="display: block"]) {
    opacity: 1;
    #send_form { display: none !important; }
  }

  #top-bar,
  #top-settings-holder,
  .drawer-toggle {
    opacity: 0;
    transition: all 0.5s ease;
  }

  /* 核心呼出机制：抽屉打开或鼠标悬停时才显示 */
  &:has(.drawer-content.openDrawer, .drawer:hover) {
    #top-bar,
    #top-settings-holder,
    .drawer-toggle {
      opacity: 1;
    }
  }

  #extensionConnectionProfiles {
    position: absolute !important;
    top: calc(var(--topBarBlockSize) * 2) !important;
    z-index: 100;
  }

  #extensionTopBar {
    position: absolute !important;
    top: var(--topBarBlockSize) !important;
    z-index: 100;
    opacity: 0;
    transition: all 0.5s ease;
    &:focus-within,
    &:hover,
    &:has(#extensionTopBarSearchInput:not(:placeholder-shown), #extensionTopBarToggleConnectionProfiles.active, #extensionTopBarToggleSidebar.active) {
      opacity: 1;
    }
  }
}
`;

// ================== 插件的 UI HTML ==================
const uiHTML = `
<div class="inline-drawer wide100p flexFlowColumn" id="te-settings-drawer">
    <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
        <b><span>全屏设置</span></b>
        <div class="fa-solid fa-circle-chevron-down inline-drawer-icon down"></div>
    </div>
    <div class="inline-drawer-content" style="display: none;">
        
        <label class="checkbox_label">
            <input type="checkbox" id="te_fullscreen" />
            <span>启用全屏模式</span>
        </label>
        
        <div id="te_fs_options" class="te-sub-options">
            <div class="flex-container alignitemscenter margin-b-5">
                <span class="te-setting-title">底栏上下位置：</span>
                <input type="number" id="te_bottom_bar_pos" class="text_pole" style="width: 100px; text-align: center;" value="0">
            </div>
            <label class="checkbox_label">
                <input type="checkbox" id="te_only_hide_top_bar" />
                <span>仅隐藏顶栏</span>
            </label>
        </div>
    </div>
</div>
`;

// 刷新 CSS class 和变量
function updateBodyClasses() {
    $('body').toggleClass('te-fullscreen', Boolean(settings.fullscreen));
    $('body').toggleClass('te-only-hide-top-bar', Boolean(settings.fullscreen && settings.onlyHideTopBar));
    document.body.style.setProperty('--te-bottom-bar-pos', settings.bottomBarPosition);
}

// 初始化插件
jQuery(async () => {
    // 动态将内置的 CSS 注入到网页的 head 标签中
    $('head').append(\`<style id="te-fullscreen-style">\${customCSS}</style>\`);

    // 注入 UI 设置面板
    const $target = $('div[name="themeElements"] > .inline-drawer.wide100p.flexFlowColumn').first();
    $target.before(uiHTML);

    // 回显保存的设置数据
    $('#te_fullscreen').prop('checked', settings.fullscreen);
    $('#te_bottom_bar_pos').val(settings.bottomBarPosition);
    $('#te_only_hide_top_bar').prop('checked', settings.onlyHideTopBar);

    if (settings.fullscreen) $('#te_fs_options').show();

    // 初始化 CSS 类名
    updateBodyClasses();

    // ---------------- 事件绑定 ----------------
    $('#te_fullscreen').on('change', function() {
        settings.fullscreen = $(this).is(':checked');
        settings.fullscreen ? $('#te_fs_options').slideDown(200) : $('#te_fs_options').slideUp(200);
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_bottom_bar_pos').on('input', function() {
        settings.bottomBarPosition = $(this).val() || 0;
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_only_hide_top_bar').on('change', function() {
        settings.onlyHideTopBar = $(this).is(':checked');
        updateBodyClasses();
        saveSettingsDebounced();
    });
});
