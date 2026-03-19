
class Shuffle {
 public static void main(String [] args) {
 int x = 3;
 while (x > 0) {
 if (x > 2) {
 System.out.print("a");
 }
 x = x - 1;
 System.out.print("-");
 if (x == 2) {
 System.out.print("b c");
 Dog d = new Dog();
 d.size = 40;
 d.bark();
 System.out.println("run dog");
 }
 if (x == 1) {
 System.out.print("d");
 x = x - 1;
 }
 }
 }
}

class Dog {
    int size;
    String breed;
    String name;
    void bark() {
        System.out.println("Ruff! Ruff!");
    }
}
