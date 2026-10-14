import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "SillyTavern-Fullscreen";

// 默认设置
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

// 插件的 UI HTML（扁平直观，不再套娃隐藏）
const uiHTML = `
<div class="inline-drawer" id="te-settings-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
        <b>全屏设置</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content" style="display: none;">
        <label class="checkbox_label">
            <input type="checkbox" id="te_fullscreen" />
            <span>启用全屏模式</span>
        </label>
        
        <label class="checkbox_label" style="margin-top: 8px;">
            <input type="checkbox" id="te_only_hide_top_bar" />
            <span>仅隐藏顶栏 (不隐藏底栏)</span>
        </label>

        <div class="flex-container alignitemscenter" style="margin-top: 8px; gap: 8px;">
            <span>底栏上下位置：</span>
            <input type="number" id="te_bottom_bar_pos" class="text_pole" style="width: 80px; text-align: center;" value="0">
        </div>
    </div>
</div>
`;

// 刷新 CSS 类名与变量
function updateBodyClasses() {
    $('body').toggleClass('te-fullscreen', Boolean(settings.fullscreen));
    $('body').toggleClass('te-only-hide-top-bar', Boolean(settings.fullscreen && settings.onlyHideTopBar));
    document.body.style.setProperty('--te-bottom-bar-pos', settings.bottomBarPosition);
}

// 初始化插件
jQuery(async () => {
    // 注入到扩展列表（SillyTavern 标准扩展面板）
    const $container = $('#extensions_settings, #extensions_settings2').first();
    if ($container.length) {
        $container.append(uiHTML);
    } else {
        $('#rm_extensions_block').append(uiHTML);
    }

    // 回显保存的状态
    $('#te_fullscreen').prop('checked', Boolean(settings.fullscreen));
    $('#te_only_hide_top_bar').prop('checked', Boolean(settings.onlyHideTopBar));
    $('#te_bottom_bar_pos').val(settings.bottomBarPosition);

    updateBodyClasses();

    // 绑定设置修改事件
    $('#te_fullscreen').on('change', function() {
        settings.fullscreen = $(this).is(':checked');
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_only_hide_top_bar').on('change', function() {
        settings.onlyHideTopBar = $(this).is(':checked');
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_bottom_bar_pos').on('input', function() {
        settings.bottomBarPosition = $(this).val() || 0;
        updateBodyClasses();
        saveSettingsDebounced();
    });
});
