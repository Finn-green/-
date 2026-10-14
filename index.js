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

// 插件的 UI HTML
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

// 刷新 CSS 类名与变量
function updateBodyClasses() {
    $('body').toggleClass('te-fullscreen', Boolean(settings.fullscreen));
    $('body').toggleClass('te-only-hide-top-bar', Boolean(settings.fullscreen && settings.onlyHideTopBar));
    document.body.style.setProperty('--te-bottom-bar-pos', settings.bottomBarPosition);
}

// 初始化插件
jQuery(async () => {
    // 【关键修改】：寻找扩展页面容器 (#extensions_settings)，直接把入口挂在扩展列表里！
    const $container = $('#extensions_settings, #extensions_settings2').first();
    if ($container.length) {
        $container.append(uiHTML);
    } else {
        $('#rm_extensions_block').append(uiHTML);
    }

    // 回显保存的开关状态
    $('#te_fullscreen').prop('checked', settings.fullscreen);
    $('#te_bottom_bar_pos').val(settings.bottomBarPosition);
    $('#te_only_hide_top_bar').prop('checked', settings.onlyHideTopBar);

    if (settings.fullscreen) $('#te_fs_options').show();

    // 绑定折叠面板的展开/收起点击事件
    $('#te-settings-drawer .inline-drawer-toggle').on('click', function() {
        $('#te-settings-drawer .inline-drawer-content').slideToggle(200);
        $(this).find('.inline-drawer-icon').toggleClass('down up');
    });

    updateBodyClasses();

    // 绑定开关变动事件
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
