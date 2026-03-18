import 'package:flutter/material.dart';
import 'screens/assets_view.dart';
import 'screens/assets_gallery.dart';

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    home: AssetsGallery(), // استخدم AssetsGallery الجديد، يمكنك التغيير لـ AssetsView
  ));
}
