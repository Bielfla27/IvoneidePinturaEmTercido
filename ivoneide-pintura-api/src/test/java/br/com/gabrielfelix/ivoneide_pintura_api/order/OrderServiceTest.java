package br.com.gabrielfelix.ivoneide_pintura_api.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderCreateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderDownloadResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderItemRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderStatusUpdateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.product.Product;
import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductService;
import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductType;
import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRole;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserService;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

	@Mock
	private OrderRepository orderRepository;

	@Mock
	private UserService userService;

	@Mock
	private ProductService productService;

	@InjectMocks
	private OrderService orderService;

	@Test
	void shouldCreateOrderWithTotalCalculatedFromProductPrice() {
		User user = user(1L, UserRole.USER);
		Product product = product(10L, "Apostila Rosas", new BigDecimal("15.00"), true);
		OrderCreateRequest request = orderRequest(10L, 2);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(productService.findById(10L)).thenReturn(product);
		when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
			Order order = invocation.getArgument(0);
			ReflectionTestUtils.setField(order, "id", 100L);
			ReflectionTestUtils.setField(order, "criadoEm", LocalDateTime.now());
			return order;
		});

		OrderResponse response = orderService.create("user@email.com", request);

		assertThat(response.getId()).isEqualTo(100L);
		assertThat(response.getValorTotal()).isEqualByComparingTo("30.00");
		assertThat(response.getItens()).hasSize(1);
		assertThat(response.getItens().get(0).getSubtotal()).isEqualByComparingTo("30.00");
	}

	@Test
	void shouldNotCreateOrderWithInactiveProduct() {
		User user = user(1L, UserRole.USER);
		Product product = product(10L, "Apostila Rosas", new BigDecimal("15.00"), false);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(productService.findById(10L)).thenReturn(product);

		assertThatThrownBy(() -> orderService.create("user@email.com", orderRequest(10L, 1)))
				.isInstanceOf(OrderBusinessException.class)
				.hasMessageContaining("nao esta disponivel");

		verify(orderRepository, never()).save(any(Order.class));
	}

	@Test
	void shouldFindOnlyOwnOrderForNormalUser() {
		User user = user(1L, UserRole.USER);
		Order order = paidOrder(50L, user);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(orderRepository.findByIdAndUsuario(50L, user)).thenReturn(Optional.of(order));

		OrderResponse response = orderService.findById(50L, "user@email.com");

		assertThat(response.getId()).isEqualTo(50L);
		verify(orderRepository, never()).findById(50L);
	}

	@Test
	void shouldAllowAdminToFindAnyOrder() {
		User admin = user(1L, UserRole.ADMIN);
		User buyer = user(2L, UserRole.USER);
		Order order = paidOrder(50L, buyer);

		when(userService.findByEmail("admin@email.com")).thenReturn(admin);
		when(orderRepository.findById(50L)).thenReturn(Optional.of(order));

		OrderResponse response = orderService.findById(50L, "admin@email.com");

		assertThat(response.getId()).isEqualTo(50L);
	}

	@Test
	void shouldListOnlyPaidOrdersInPurchaseHistory() {
		User user = user(1L, UserRole.USER);
		Order paidOrder = paidOrder(50L, user);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(orderRepository.findByUsuarioAndStatusOrderByCriadoEmDesc(user, OrderStatus.PAGO))
				.thenReturn(List.of(paidOrder));

		List<OrderResponse> history = orderService.findMyPurchaseHistory("user@email.com");

		assertThat(history).hasSize(1);
		assertThat(history.get(0).getStatus()).isEqualTo(OrderStatus.PAGO);
	}

	@Test
	void shouldReleaseDownloadsOnlyForPaidOrder() {
		User user = user(1L, UserRole.USER);
		Order order = paidOrder(50L, user);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(orderRepository.findByIdAndUsuario(50L, user)).thenReturn(Optional.of(order));

		List<OrderDownloadResponse> downloads = orderService.findDownloads(50L, "user@email.com");

		assertThat(downloads).hasSize(1);
		assertThat(downloads.get(0).getUrlPdf()).isEqualTo("https://exemplo.com/apostila.pdf");
	}

	@Test
	void shouldNotReleaseDownloadsForUnpaidOrder() {
		User user = user(1L, UserRole.USER);
		Order order = order(50L, user, OrderStatus.CRIADO);

		when(userService.findByEmail("user@email.com")).thenReturn(user);
		when(orderRepository.findByIdAndUsuario(50L, user)).thenReturn(Optional.of(order));

		assertThatThrownBy(() -> orderService.findDownloads(50L, "user@email.com"))
				.isInstanceOf(OrderBusinessException.class)
				.hasMessage("Este pedido ainda nao esta pago.");
	}

	@Test
	void shouldUpdateOrderStatus() {
		User user = user(1L, UserRole.USER);
		Order order = order(50L, user, OrderStatus.CRIADO);

		when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
		when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

		orderService.updateStatus(50L, statusRequest(OrderStatus.PAGO));

		ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
		verify(orderRepository).save(captor.capture());
		assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.PAGO);
	}

	private OrderCreateRequest orderRequest(Long productId, Integer quantity) {
		OrderItemRequest itemRequest = new OrderItemRequest();
		itemRequest.setProdutoId(productId);
		itemRequest.setQuantidade(quantity);

		OrderCreateRequest request = new OrderCreateRequest();
		request.setItens(List.of(itemRequest));
		return request;
	}

	private OrderStatusUpdateRequest statusRequest(OrderStatus status) {
		OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
		request.setStatus(status);
		return request;
	}

	private User user(Long id, UserRole role) {
		User user = new User("Usuario Teste", role == UserRole.ADMIN ? "admin@email.com" : "user@email.com",
				"123456789", role, true);
		ReflectionTestUtils.setField(user, "id", id);
		return user;
	}

	private Product product(Long id, String name, BigDecimal price, Boolean active) {
		Product product = new Product(name, "Descricao", price, ProductType.APOSTILA,
				"https://exemplo.com/apostila.pdf", null, active);
		ReflectionTestUtils.setField(product, "id", id);
		return product;
	}

	private Order paidOrder(Long id, User user) {
		return order(id, user, OrderStatus.PAGO);
	}

	private Order order(Long id, User user, OrderStatus status) {
		Product product = product(10L, "Apostila Rosas", new BigDecimal("15.00"), true);
		Order order = new Order(user, status, new BigDecimal("15.00"));
		order.addItem(new OrderItem(product, 1, new BigDecimal("15.00"), new BigDecimal("15.00")));
		ReflectionTestUtils.setField(order, "id", id);
		ReflectionTestUtils.setField(order, "criadoEm", LocalDateTime.now());
		return order;
	}
}
