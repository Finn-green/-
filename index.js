import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "SillyTavern-Fullscreen";

// 默认设置（加入 preventArrowOverlap 和 bottomBarPadding）
const defaultSettings = {
    fullscreen: false,
    bottomBarPosition: 0, 
    onlyHideTopBar: false,
    preventArrowOverlap: true, // 默认开启防遮挡
    bottomBarPadding: 60       // 避让距离，默认垫高 60px
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

// 插件的 UI HTML
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

        <label class="checkbox_label" style="margin-top: 8px;">
            <input type="checkbox" id="te_prevent_arrow_overlap" />
            <span>底栏不挡正文/箭头</span>
        </label>

        <div class="flex-container alignitemscenter" style="margin-top: 8px; gap: 8px;">
            <span>正文底部避让间距：</span>
            <input type="number" id="te_bottom_bar_padding" class="text_pole" style="width: 80px; text-align: center;" value="60">
        </div>

        <div class="flex-container alignitemscenter" style="margin-top: 8px; gap: 8px;">
            <span>底栏上下偏移位置：</span>
            <input type="number" id="te_bottom_bar_pos" class="text_pole" style="width: 80px; text-align: center;" value="0">
        </div>
    </div>
</div>
`;

// 刷新 CSS 类名与变量
function updateBodyClasses() {
    $('body').toggleClass('te-fullscreen', Boolean(settings.fullscreen));
    $('body').toggleClass('te-only-hide-top-bar', Boolean(settings.fullscreen && settings.onlyHideTopBar));
    $('body').toggleClass('te-prevent-arrow-overlap', Boolean(settings.preventArrowOverlap));

    document.body.style.setProperty('--te-bottom-bar-pos', settings.bottomBarPosition);
    document.body.style.setProperty('--te-bottom-bar-padding', settings.bottomBarPadding);
}

// 初始化插件
jQuery(async () => {
    // 注入到扩展列表
    const $container = $('#extensions_settings, #extensions_settings2').first();
    if ($container.length) {
        $container.append(uiHTML);
    } else {
        $('#rm_extensions_block').append(uiHTML);
    }

    // 回显保存的状态
    $('#te_fullscreen').prop('checked', Boolean(settings.fullscreen));
    $('#te_only_hide_top_bar').prop('checked', Boolean(settings.onlyHideTopBar));
    $('#te_prevent_arrow_overlap').prop('checked', Boolean(settings.preventArrowOverlap));
    $('#te_bottom_bar_padding').val(settings.bottomBarPadding);
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

    $('#te_prevent_arrow_overlap').on('change', function() {
        settings.preventArrowOverlap = $(this).is(':checked');
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_bottom_bar_padding').on('input', function() {
        settings.bottomBarPadding = $(this).val() || 0;
        updateBodyClasses();
        saveSettingsDebounced();
    });

    $('#te_bottom_bar_pos').on('input', function() {
        settings.bottomBarPosition = $(this).val() || 0;
        updateBodyClasses();
        saveSettingsDebounced();
    });
});
