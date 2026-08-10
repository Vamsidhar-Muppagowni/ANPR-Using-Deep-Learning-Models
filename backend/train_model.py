import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Flatten, MaxPooling2D, Conv2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import datetime

# Limit GPU memory usage if GPU is available
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

def train_and_save_model():
    print("Setting up data generators...")
    train_datagen = ImageDataGenerator(rescale=1./255, width_shift_range=0.05, height_shift_range=0.05)

    base_dir = os.path.join(os.path.dirname(__file__), 'data', 'data')
    train_dir = os.path.join(base_dir, 'train')
    val_dir = os.path.join(base_dir, 'val')

    train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=(28,28),
            batch_size=1,
            color_mode='grayscale',
            class_mode='categorical')

    validation_generator = train_datagen.flow_from_directory(
            val_dir,
            target_size=(28,28),
            batch_size=1,
            color_mode='grayscale',
            class_mode='categorical')

    num_classes = train_generator.num_classes
    print(f"Number of classes: {num_classes}")

    print("Building model...")
    model = Sequential()
    model.add(Conv2D(filters=32, kernel_size=(5,5), input_shape=(28, 28, 1), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(rate=0.4))
    model.add(Flatten())
    model.add(Dense(units=128, activation='relu'))
    model.add(Dense(units=num_classes, activation='softmax'))

    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    class stop_training_callback(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs={}):
            if(logs.get('val_accuracy') is not None and logs.get('val_accuracy') > 0.99):
                print("\nReached 99% validation accuracy, stopping training.")
                self.model.stop_training = True

    callbacks = [stop_training_callback()]

    print("Starting training...")
    # Using small number of epochs since we want to just train it and test it
    model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // 1,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // 1,
        epochs=15, 
        callbacks=callbacks
    )

    model_path = os.path.join(os.path.dirname(__file__), 'anpr_model.keras')
    model.save(model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_and_save_model()
