import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'dart:convert';

class AssetsView extends StatefulWidget {
  @override
  _AssetsViewState createState() => _AssetsViewState();
}

class _AssetsViewState extends State<AssetsView> {
  List<String> images = [];
  List<String> audio = [];
  List<Map<String, dynamic>> jsonFiles = [];

  @override
  void initState() {
    super.initState();
    loadAssets();
  }

  Future<void> loadAssets() async {
    final manifestContent = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> manifestMap = json.decode(manifestContent);

    images = manifestMap.keys.where((key) => key.startsWith('assets/images/')).toList();
    audio = manifestMap.keys.where((key) => key.startsWith('assets/audio/')).toList();
    final jsonPaths = manifestMap.keys.where((key) => key.startsWith('assets/json/')).toList();
    for (var path in jsonPaths) {
      final content = await rootBundle.loadString(path);
      jsonFiles.add(json.decode(content));
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Assets Viewer')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Images:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...images.map((img) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 4),
                  child: Image.asset(img),
                )),
            SizedBox(height: 20),
            Text('Audio:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...audio.map((a) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 2),
                  child: Text(a),
                )),
            SizedBox(height: 20),
            Text('JSON:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...jsonFiles.map((j) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 2),
                  child: Text(jsonEncode(j)),
                )),
          ],
        ),
      ),
    );
  }
}
