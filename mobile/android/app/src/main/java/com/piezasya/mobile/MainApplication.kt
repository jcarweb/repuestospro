package com.piezasya.mobile

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> = listOf(
        MainReactPackage()
    )

    override fun getJSMainModuleName(): String = "index"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
  }

  override fun getReactNativeHost(): ReactNativeHost = mReactNativeHost

  override fun onCreate() {
    SoLoader.init(this, false)
    super.onCreate()
    // DefaultNewArchitectureEntryPoint.load() // Deshabilitado temporalmente
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
  }
}
