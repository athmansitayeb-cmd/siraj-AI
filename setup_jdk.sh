#!/bin/bash

# تحقق من وجود JDK
if ! java -version &>/dev/null; then
    echo "JDK غير مثبت، جاري التثبيت..."
    sudo apt update && sudo apt install -y openjdk-17-jdk
else
    echo "JDK مثبت بالفعل."
fi

# تحديد JAVA_HOME الصحيح
JDK_PATH=$(update-java-alternatives -l | awk '{print $3}' | head -n 1)
if ! grep -q "JAVA_HOME" ~/.bashrc; then
    echo "export JAVA_HOME=$JDK_PATH" >> ~/.bashrc
    echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
    source ~/.bashrc
    echo "JAVA_HOME تم ضبطه على $JDK_PATH"
else
    echo "JAVA_HOME موجود بالفعل في ~/.bashrc"
fi

# التحقق النهائي
echo "java version الحالية:"
java -version
echo "JAVA_HOME الحالية: $JAVA_HOME"
