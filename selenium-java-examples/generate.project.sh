#!/bin/bash

# Créer la structure du projet
mkdir -p project-root/src/main/java/com/example/utils
mkdir -p project-root/src/test/java/com/example
mkdir -p project-root/resources

# Créer le fichier TestData.java
cat <<EOL > project-root/src/main/java/com/example/utils/TestData.java
package com.example.utils;

import java.util.List;
import java.util.Map;

public class TestData {
    private String pageLink;
    private List<TestCase> testCases;

    public String getPageLink() {
        return pageLink;
    }

    public void setPageLink(String pageLink) {
        this.pageLink = pageLink;
    }

    public List<TestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCase> testCases) {
        this.testCases = testCases;
    }

    public static class TestCase {
        private String testCaseName;
        private Map<String, String> inputs;
        private List<Map<String, String>> expectations;

        public String getTestCaseName() {
            return testCaseName;
        }

        public void setTestCaseName(String testCaseName) {
            this.testCaseName = testCaseName;
        }

        public Map<String, String> getInputs() {
            return inputs;
        }

        public void setInputs(Map<String, String> inputs) {
            this.inputs = inputs;
        }

        public List<Map<String, String>> getExpectations() {
            return expectations;
        }

        public void setExpectations(List<Map<String, String>> expectations) {
            this.expectations = expectations;
        }
    }
}
EOL

# Créer le fichier SeleniumTest.java
cat <<EOL > project-root/src/test/java/com/example/SeleniumTest.java
package com.example;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class SeleniumTest {
    protected WebDriver driver;

    @BeforeEach
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "chemin/vers/chromedriver");
        driver = new ChromeDriver();
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
EOL

# Créer le fichier DynamicTests.java
cat <<EOL > project-root/src/test/java/com/example/DynamicTests.java
package com.example;

import com.example.utils.TestData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

public class DynamicTests extends SeleniumTest {

    @TestFactory
    Collection<DynamicTest> dynamicTestsFromJson() throws Exception {
        // Charger les données de test depuis le fichier JSON
        ObjectMapper objectMapper = new ObjectMapper();
        TestData testData = objectMapper.readValue(
                new File("src/test/resources/accountFormWithStaticDatas.json"), TestData.class);

        // Générer des tests dynamiques
        return testData.getTestCases().stream()
                .flatMap(testCase -> Stream.of(
                        dynamicTest(testCase.getTestCaseName(), () -> runTest(testData.getPageLink(), testCase))
                ))
                .toList();
    }

    private void runTest(String pageLink, TestData.TestCase testCase) {
        // Naviguer vers la page
        driver.get(pageLink);

        // Remplir les champs du formulaire
        testCase.getInputs().forEach((fieldId, value) -> {
            WebElement element = driver.findElement(By.id(fieldId));
            if ("select".equals(element.getTagName())) {
                // Gérer les listes déroulantes
                element.findElement(By.xpath(".//option[text()='" + value + "']")).click();
            } else {
                // Gérer les champs de texte
                element.clear();
                element.sendKeys(value);
            }
        });

        // Vérifier les attentes
        testCase.getExpectations().forEach(expectation -> {
            expectation.forEach((actionTestId, expectedState) -> {
                WebElement element = driver.findElement(By.cssSelector("[data-testid='" + actionTestId + "']"));
                switch (expectedState) {
                    case "visible":
                        assertTrue(element.isDisplayed(), "L'élément devrait être visible");
                        break;
                    case "hidden":
                        assertTrue(!element.isDisplayed(), "L'élément devrait être caché");
                        break;
                    case "enabled":
                        assertTrue(element.isEnabled(), "L'élément devrait être activé");
                        break;
                    case "disabled":
                        assertTrue(!element.isEnabled(), "L'élément devrait être désactivé");
                        break;
                    default:
                        throw new IllegalArgumentException("État non pris en charge : " + expectedState);
                }
            });
        });
    }
}
EOL

# Créer le fichier accountFormWithStaticDatas.json
cat <<EOL > project-root/resources/accountFormWithStaticDatas.json
{
  "pageLink": "https://example.com/create-account",
  "testCases": [
    {
      "testCaseName": "Test Case 1",
      "inputs": {
        "firstName": "John",
        "lastName": "Doe",
        "country": "FR"
      },
      "expectations": [
        {
          "submit-button": "enabled"
        },
        {
          "error-message": "hidden"
        }
      ]
    },
    {
      "testCaseName": "Test Case 2",
      "inputs": {
        "firstName": "",
        "lastName": "",
        "country": ""
      },
      "expectations": [
        {
          "submit-button": "disabled"
        },
        {
          "error-message": "visible"
        }
      ]
    }
  ]
}
EOL

# Créer le fichier pom.xml
cat <<EOL > project-root/pom.xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>dynamic-selenium-tests</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Selenium -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>4.10.0</version>
        </dependency>

        <!-- JUnit 5 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>

        <!-- Jackson pour la lecture du JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0-M7</version>
            </plugin>
        </plugins>
    </build>
</project>
EOL

echo "Structure du projet générée avec succès dans le dossier 'project-root'."