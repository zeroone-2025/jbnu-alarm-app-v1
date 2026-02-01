package kr.zerotime.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // WebView 설정 최적화
        this.bridge.getWebView().post(() -> {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();

            // DOM Storage 활성화 (필수)
            settings.setDomStorageEnabled(true);

            // 파일 접근 허용
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);

            // 캐시 설정
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            // Mixed Content 허용 (개발 환경)
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

            // 하드웨어 가속 활성화
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

            // 강제 새로고침 (캐시된 CSS 문제 해결)
            webView.clearCache(true);
        });
    }
}
